import { Animated, Easing, StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";
import LetterSoundButton from "./LetterSoundButton";
import { LanguageCode } from "@/types/soundTypes"; // Import the LanguageCode type
import { playSound } from "@/utils/audioUtils";
import { Pressable } from "react-native";
import { useState } from "react";

interface Props {
  letters: string[];
  language: LanguageCode;
}

export default function LetterSoundGrid({ letters, language }: Props) {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleSelect = (letter: string) => {
    playSound(letter, language);
    setSelectedLetter(letter);
  };

  const handleSubmit = (letter: string) => {
    if (selectedLetter === letter) {
      console.log("Right letter");
    } else {
      console.log("Wrong letter");
    }
  };

  return (
    <ThemedView style={[styles.column]}>
      <ThemedView style={[styles.container]}>
        {letters.map((letter) => (
          <LetterSoundButton
            key={letter}
            onPress={() => handleSelect(letter)}
            size={45}
            selected={selectedLetter === letter}
          >
            <ThemedText style={styles.buttonText}>{letter}</ThemedText>
            <IconSymbol size={20} name="speaker.3" color="white" />
          </LetterSoundButton>
        ))}
      </ThemedView>

      <ThemedText style={[styles.text, { marginBottom: 15 }]}>
        Which sound is this?
      </ThemedText>
      <LetterSoundButton
        onPress={() => playSound("a", language)}
        size={80}
        selected={false}
      >
        <IconSymbol size={20} name="speaker.3" color="white" />
      </LetterSoundButton>
      <Pressable
        style={[
          styles.pressable,
          { opacity: selectedLetter === null ? 0.5 : 1 },
          selectedLetter !== null && {
            borderWidth: 2,
            borderColor: "blue", // Add a color to the border
          },
        ]}
        disabled={selectedLetter === null}
        onPress={() => handleSubmit("a")}
      >
        <ThemedText>
          {selectedLetter ? `Submit ${selectedLetter}.` : "Pick a letter"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 80,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
  text: {
    color: "black",
    fontSize: 16,
  },
  pressable: {
    backgroundColor: "lightgreen",
    borderRadius: 10,
    marginTop: 15,
    padding: 10,
  },
});
