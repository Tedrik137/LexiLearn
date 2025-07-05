import { useState } from "react";
import ScrambledWord from "./ScrambledWord";
import UnscrambledAreaBoxes from "./UnscrambledAreaBoxes";
import { ThemedView } from "./ThemedView";
import { localizedLanguageProperties } from "@/entities/languageProperties";
import { useAuthStore } from "@/stores/authStore";

export interface Letter {
  char: string;
  index: number;
}

interface Props {
  scrambledWord: string;
}

const ScrambledWordQuizGrid = ({ scrambledWord }: Props) => {
  const selectedLanguage = useAuthStore((state) => state.selectedLanguage);

  const [scrambledLetters, setScrambledLetters] = useState<(Letter | null)[]>(
    scrambledWord.split("").map((char, index) => ({
      char,
      index,
    }))
  );

  const [unscrambledLetters, setUnscrambledLetters] = useState<
    (Letter | null)[]
  >(Array(scrambledWord.length).fill(null));

  const onScrambledLetterPress = (letter: Letter) => {
    // Find the first empty slot in the answer area
    let firstAvailableIndex = unscrambledLetters.findIndex((l) => l === null);

    if (localizedLanguageProperties[selectedLanguage!].direction === "rtl") {
      // If the language is RTL, find the last empty slot instead
      firstAvailableIndex = unscrambledLetters
        .slice()
        .reverse()
        .findIndex((l) => l === null);

      firstAvailableIndex = unscrambledLetters.length - 1 - firstAvailableIndex;
    }

    // If no slots are available, do nothing
    if (firstAvailableIndex === -1) {
      return;
    }

    const newScrambledLetters = [...scrambledLetters];
    newScrambledLetters[letter.index] = null;

    const newUnscrambledLetters = [...unscrambledLetters];
    newUnscrambledLetters[firstAvailableIndex] = letter;

    setUnscrambledLetters(newUnscrambledLetters);
    setScrambledLetters(newScrambledLetters);
  };

  const onUnscrambledLetterPress = (
    letter: Letter,
    unscrambledIndex: number
  ) => {
    // Find the index of the letter in the unscrambled area
    const letterIndex = letter.index;

    const newScrambledLetters = [...scrambledLetters];
    newScrambledLetters[letterIndex] = letter;

    const newUnscrambledLetters = [...unscrambledLetters];
    newUnscrambledLetters[unscrambledIndex] = null;

    setUnscrambledLetters(newUnscrambledLetters);
    setScrambledLetters(newScrambledLetters);
  };

  return (
    <ThemedView>
      <UnscrambledAreaBoxes
        scrambledLetters={unscrambledLetters}
        onLetterPress={onUnscrambledLetterPress}
      />
      <ScrambledWord
        scrambledLetters={scrambledLetters}
        onLetterPress={onScrambledLetterPress}
      />
    </ThemedView>
  );
};

export default ScrambledWordQuizGrid;
