import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { getFunctions, httpsCallable } from "firebase/functions"; // Import Functions SDK
import { LanguageCode } from "@/types/languages";

// Assuming firebaseApp is initialized and exported from firebaseConfig.ts
// Make sure connectFunctionsEmulator is called in firebaseConfig.ts during development!
const functions = getFunctions(); // Get Functions instance

const CACHE_FOLDER = `${FileSystem.cacheDirectory}audio/`;

let currentSound: Audio.Sound | undefined;
let currentRequestId = 0;

// Helper function to play audio (remains mostly the same)
async function playAudio(uri: string, requestId: number) {
  if (requestId !== currentRequestId) return; // Check if it's still the latest request

  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    currentSound = sound;
    await sound.playAsync();
    // Optional: Add onPlaybackStatusUpdate to unload when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = undefined;
      }
    });
  } catch (error) {
    console.error("Error playing audio:", error);
    currentSound = undefined; // Ensure cleanup on error
  }
}

export async function playSound(text: string, language: LanguageCode) {
  if (!text || !language) return;

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

  const fileName = `${encodeURIComponent(text)}-${language}.mp3`;
  const cachedFilePath = `${CACHE_FOLDER}${fileName}`;

  // Check local cache first
  const fileInfo = await FileSystem.getInfoAsync(cachedFilePath);
  if (fileInfo.exists) {
    console.log(`Playing cached audio for "${text}"`);
    return playAudio(cachedFilePath, requestId);
  }

  // Ensure cache directory exists
  await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });

  try {
    console.log(`Audio not cached for "${text}", calling Cloud Function...`);
    // Get the callable function reference
    const getOrCreateTTS = httpsCallable(functions, "getOrCreateTTSAudio");

    // Call the function with necessary data
    const result = await getOrCreateTTS({
      fileName: fileName,
      text: text,
      language: language,
    });

    // Type assertion for the expected data structure
    const { success, encodedMP3, source } = result.data as {
      success: boolean;
      encodedMP3: string;
      source: string;
    };

    if (success && encodedMP3) {
      console.log(`Received audio from Cloud Function (source: ${source})`);
      // Save Base64 MP3 to a file
      await FileSystem.writeAsStringAsync(cachedFilePath, encodedMP3, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Ensure this is still the latest request before playing
      if (requestId === currentRequestId) {
        console.log(`Playing ${source} audio for "${text}"`);
        return playAudio(cachedFilePath, requestId);
      } else {
        console.log(
          "Newer audio request arrived, skipping playback for this one."
        );
      }
    } else {
      // The error should ideally be caught in the catch block below
      // due to the Cloud Function throwing HttpsError
      console.error(
        "Cloud Function call reported failure or missing audio data:",
        result.data
      );
    }
  } catch (error: any) {
    // Handle errors thrown by the callable function (HttpsError)
    console.error(
      `Error calling getOrCreateTTSAudio Cloud Function for "${text}":`,
      error
    );
    // You could inspect error.code and error.message here for more details
  }
}
