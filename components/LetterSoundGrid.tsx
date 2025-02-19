import { StyleSheet, TouchableHighlight } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";
import LetterSound from "./LetterSound";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { soundFiles } from "@/constants/soundFiles";
import { LanguageCode } from "@/types/soundTypes"; // Import the LanguageCode type

interface Props {
  letters: string[];
  language: LanguageCode; // Enforce that `language` is one of the valid keys
}

export default function LetterSoundGrid({ letters, language }: Props) {
  const [sound, setSound] = useState<Audio.Sound>();

  async function playSound(letter: string) {
    if (!soundFiles[language] || !soundFiles[language][letter]) {
      console.error(
        `Sound file for letter ${letter} not found in language ${language}`
      );
      return;
    }

    if (sound) {
      await sound.unloadAsync();
      setSound(undefined);
    }

    console.log(`Loading Sound for ${letter} in ${language}`);

    let loadedSound: Audio.Sound;
    try {
      const result = await Audio.Sound.createAsync(
        soundFiles[language][letter]
      );
      loadedSound = result.sound; // Assign sound after awaiting
    } catch (error) {
      console.error("Error loading sound: ", error);
      return;
    }

    setSound(loadedSound);

    console.log("Playing Sound");
    await loadedSound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ThemedView style={[styles.container]}>
      {letters.map((letter) => (
        <LetterSound
          key={letter}
          letter={letter}
          playSound={() => playSound(letter)}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
