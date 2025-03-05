import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

let currentSound: Audio.Sound | undefined = undefined;
let currentRequestId: number = 0; // Track latest request

const CACHE_FOLDER = `${FileSystem.cacheDirectory}tts/`; // Store TTS files

export async function playSound(text: string, language: string) {
  if (!text || !language) return;

  // Track the latest request
  const requestId = ++currentRequestId;

  // Stop and unload previous sound before playing a new one
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = undefined;
  }

  // Check if the file is already cached
  const cachedFilePath = `${CACHE_FOLDER}${text}-${language}.mp3`;
  const fileInfo = await FileSystem.getInfoAsync(cachedFilePath);

  if (fileInfo.exists) {
    console.log(`Playing cached audio for "${text}"`);
    return playAudio(cachedFilePath, requestId);
  }

  // Ensure cache directory exists
  await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });

  try {
    const ttsResponse = await fetch("/api/tts", {
      method: "POST",
      body: JSON.stringify({ text: text, language: language }),
    });

    const { encodedMP3 } = await ttsResponse.json();

    // Save Base64 MP3 to a file
    await FileSystem.writeAsStringAsync(cachedFilePath, encodedMP3, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Ensure this is still the latest request
    if (requestId === currentRequestId) {
      console.log(`Playing new audio for "${text}"`);
      return playAudio(cachedFilePath, requestId);
    }
  } catch (error) {
    console.error(error);
  }
}

// Function to play audio while ensuring it's the latest request
async function playAudio(filePath: string, requestId: number) {
  if (requestId !== currentRequestId) return; // Ignore old requests

  const { sound } = await Audio.Sound.createAsync({ uri: filePath });
  currentSound = sound;
  await sound.playAsync();
}

// Cleanup function
export async function unloadCurrentSound() {
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = undefined;
  }
}
