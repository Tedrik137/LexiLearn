import * as FileSystem from "expo-file-system";
import { Audio, AVPlaybackStatus } from "expo-av";
import { getFunctions, httpsCallable } from "firebase/functions"; // Import Functions SDK
import { LanguageCode } from "@/types/languages";

// Assuming firebaseApp is initialized and exported from firebaseConfig.ts
// Make sure connectFunctionsEmulator is called in firebaseConfig.ts during development!
const functions = getFunctions(); // Get Functions instance

const CACHE_FOLDER = `${FileSystem.cacheDirectory}audio/`;

let currentSound: Audio.Sound | undefined;
let currentRequestId = 0;

// Helper function to play audio. It now returns a Promise that resolves on completion.
function playAudio(uri: string, requestId: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Check if it's still the latest request
    if (requestId !== currentRequestId) {
      console.log("Skipping playback for stale request.");
      resolve(); // Resolve silently to not block the chain
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync({
        uri,
        overrideFileExtensionAndroid: "mp3",
      });
      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          // Handle unload or error states
          if (status.error) {
            console.error(`Playback Error: ${status.error}`);
            currentSound = undefined;
            reject(new Error(status.error));
          }
          return;
        }

        if (status.didJustFinish) {
          sound.unloadAsync();
          currentSound = undefined;
          resolve(); // Playback finished successfully
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error("Error creating or playing sound:", error);
      currentSound = undefined; // Ensure cleanup on error
      reject(error);
    }
  });
}

export async function playSound(
  text: string,
  language: LanguageCode,
  gender: "MALE" | "FEMALE" = "MALE"
): Promise<void> {
  if (!text || !language) {
    return;
  }

  const requestId = ++currentRequestId;

  // Stop and unload previous sound
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (e) {
      console.warn("Error stopping/unloading previous sound:", e);
    } finally {
      currentSound = undefined;
    }
  }

  const fileName = `${encodeURIComponent(text)}-${language}-${gender}.mp3`;
  const cachedFilePath = `${CACHE_FOLDER}${fileName}`;

  try {
    // Check local cache first
    const fileInfo = await FileSystem.getInfoAsync(cachedFilePath);
    if (fileInfo.exists && fileInfo.size > 0) {
      console.log(`Playing cached audio for "${text}"`);
      await playAudio(cachedFilePath, requestId);
      return;
    }

    // Ensure cache directory exists
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });

    console.log(`Audio not cached for "${text}", calling Cloud Function...`);
    const getOrCreateTTS = httpsCallable(functions, "getOrCreateTTSAudio");

    const result = await getOrCreateTTS({
      fileName: fileName,
      text: text,
      language: language,
      gender: gender,
    });

    const { success, encodedMP3, source } = result.data as {
      success: boolean;
      encodedMP3: string;
      source: string;
    };

    if (success && encodedMP3) {
      console.log(`Received audio from Cloud Function (source: ${source})`);
      await FileSystem.writeAsStringAsync(cachedFilePath, encodedMP3, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (requestId === currentRequestId) {
        console.log(`Playing ${source} audio for "${text}"`);
        await playAudio(cachedFilePath, requestId);
      } else {
        console.log(
          "Newer audio request arrived, skipping playback for this one."
        );
      }
    } else {
      throw new Error(
        "Cloud Function call reported failure or missing audio data."
      );
    }
  } catch (error: any) {
    console.error(
      `Error calling getOrCreateTTSAudio Cloud Function for "${text}":`,
      error
    );
    // Re-throw the error so the caller's .catch() block is triggered
    throw error;
  }
}

export async function stopCurrentSound(): Promise<void> {
  currentRequestId++; // Increment to skip any ongoing playback

  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      console.log("Audio stoppped and unloaded due to focus change.");
    } catch (error) {
      console.warn("Error stopping/unloading current sound:", error);
    } finally {
      currentSound = undefined; // Ensure cleanup
    }
  }
}
