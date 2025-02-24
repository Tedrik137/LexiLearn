import { Audio } from "expo-av";
import { soundFiles } from "@/constants/soundFiles";
import { LanguageCode } from "@/types/soundTypes";

let currentSound: Audio.Sound | undefined = undefined;

export async function playSound(letter: string, language: LanguageCode) {
  if (!soundFiles[language] || !soundFiles[language][letter]) {
    console.error(
      `Sound file for letter ${letter} not found in language ${language}`
    );
    return;
  }

  // Unload previous sound if it exists
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = undefined;
  }

  console.log(`Loading Sound for ${letter} in ${language}`);

  try {
    const { sound } = await Audio.Sound.createAsync(
      soundFiles[language][letter]
    );
    currentSound = sound; // Store reference for later cleanup

    console.log("Playing Sound");
    await sound.playAsync();
  } catch (error) {
    console.error("Error loading sound: ", error);
  }
}

// Optional cleanup function if needed
export async function unloadCurrentSound() {
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = undefined;
  }
}
