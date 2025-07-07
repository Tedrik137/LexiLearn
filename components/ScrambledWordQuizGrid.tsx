import { useEffect, useState } from "react";
import ScrambledWord from "./ScrambledWord";
import UnscrambledAreaBoxes from "./UnscrambledAreaBoxes";
import { ThemedView } from "./ThemedView";
import { localizedLanguageProperties } from "@/entities/languageProperties";
import { useAuthStore } from "@/stores/authStore";
import { StyleSheet } from "react-native";

export interface Letter {
  char: string;
  index: number;
}

interface Props {
  scrambledWord: string;
  submitAnswer: (unscrambledWord: string, direction: string) => boolean;
  moveToNextQuestion: () => void; // Optional prop for moving to the next question
}

const ScrambledWordQuizGrid = ({
  scrambledWord,
  submitAnswer,
  moveToNextQuestion,
}: Props) => {
  const selectedLanguage = useAuthStore((state) => state.selectedLanguage);

  const direction =
    localizedLanguageProperties[selectedLanguage!].direction || "ltr";

  const [scrambledLetters, setScrambledLetters] = useState<(Letter | null)[]>(
    scrambledWord.split("").map((char, index) => ({
      char,
      index,
    }))
  );

  const [unscrambledLetters, setUnscrambledLetters] = useState<
    (Letter | null)[]
  >(Array(scrambledWord.length).fill(null));

  useEffect(() => {
    const newScrambledLetters = scrambledWord.split("").map((char, index) => ({
      char,
      index,
    }));
    setScrambledLetters(newScrambledLetters);
    setUnscrambledLetters(Array(scrambledWord.length).fill(null));
  }, [scrambledWord]);

  const onScrambledLetterPress = (letter: Letter) => {
    // Find the first empty slot in the answer area
    let firstAvailableIndex = unscrambledLetters.findIndex((l) => l === null);

    if (direction === "rtl") {
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

    // If the answer area is full, trigger the submission logic
    if (newUnscrambledLetters.every((l) => l !== null)) {
      const submittedWord = newUnscrambledLetters.map((l) => l!.char).join("");
      const isCorrect = submitAnswer(submittedWord, direction);

      if (isCorrect) {
        setTimeout(() => {
          moveToNextQuestion();
        }, 2000); // 2-second delay for feedback
      } else {
        // Incorrect answer: Reset the board for the current word after a delay.
        setTimeout(() => {
          const newScrambledLetters = scrambledWord
            .split("")
            .map((char, index) => ({
              char,
              index,
            }));
          setScrambledLetters(newScrambledLetters);
          setUnscrambledLetters(Array(scrambledWord.length).fill(null));
        }, 2000);
      }
    }
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
    <ThemedView style={[styles.puzzleContainer]}>
      <UnscrambledAreaBoxes
        scrambledLetters={unscrambledLetters}
        onLetterPress={onUnscrambledLetterPress}
        direction={direction}
      />
      {/* Add a visual separator */}
      <ThemedView style={[styles.separator]} />
      <ScrambledWord
        scrambledLetters={scrambledLetters}
        onLetterPress={onScrambledLetterPress}
        direction={direction}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  puzzleContainer: {
    width: "100%",
    alignItems: "center",
    padding: 20,
    marginVertical: 20,
    borderRadius: 15,
    backgroundColor: "#f7f7f7", // A light background to group the elements
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  separator: {
    height: 1,
    width: "80%",
    backgroundColor: "#dcdcdc",
    marginVertical: 20, // Creates space between the two areas
  },
});

export default ScrambledWordQuizGrid;
