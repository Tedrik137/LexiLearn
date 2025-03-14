import LetterSoundButton from "./LetterSoundButton";
import { playSound } from "@/utils/audioUtils";
import { IconSymbol } from "./ui/IconSymbol";
import { LanguageCode } from "@/types/soundTypes";
import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useEffect, useState, useMemo } from "react";
import { wordPictureTypes } from "@/entities/wordPictureTypes";

interface Props {
  language: LanguageCode;
  quizMode: string;
  currentQuestion: number;
  currentTarget: string;
  onAnswerSubmit: (selected: string) => void;
  showFeedback: boolean;
  isLastAnswerCorrect: boolean;
}

/**
 * Generate an array of word options that includes the target word and random distractors
 */
const getRandomWords = (
  correctWord: string,
  totalOptions: number = 4
): string[] => {
  // Filter out the current target word
  const otherWords = wordPictureTypes
    .filter(([word]) => word !== correctWord)
    .map(([word]) => word);

  // If we don't have enough words in our list, add some fallback words
  const fallbackWords = [
    "cat",
    "dog",
    "sun",
    "bird",
    "plane",
    "house",
    "tree",
    "car",
    "book",
    "pen",
  ];
  const allOptions =
    otherWords.length >= totalOptions - 1
      ? otherWords
      : [...otherWords, ...fallbackWords];

  // Ensure uniqueness in the options
  const uniqueOptions = Array.from(new Set(allOptions));

  // Shuffle the array and take the first (totalOptions - 1) elements
  const shuffled = [...uniqueOptions].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, totalOptions - 1);

  // Add the correct word and shuffle again
  const options = [...selectedWords, correctWord];

  return options.sort(() => 0.5 - Math.random());
};

const PictureButtonGrid = ({
  language,
  currentTarget,
  showFeedback,
  currentQuestion,
  quizMode,
  onAnswerSubmit,
  isLastAnswerCorrect,
}: Props) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Generate word options - using useMemo for performance
  const words = useMemo(
    () => getRandomWords(currentTarget, 4),
    [currentTarget, currentQuestion, quizMode]
  );

  // Reset selection when question changes
  useEffect(() => {
    setSelectedWord(null);
  }, [currentQuestion, quizMode]);

  const handleSelect = (word: string) => {
    // Play the sound when selected
    playSound(word, language);
    setSelectedWord(word);
  };

  const handleSubmit = () => {
    if (selectedWord === null) return;
    onAnswerSubmit(selectedWord);
  };

  return (
    <ThemedView style={[styles.column]}>
      {showFeedback && (
        <ThemedView
          style={[
            styles.feedbackContainer,
            isLastAnswerCorrect
              ? styles.correctFeedback
              : styles.incorrectFeedback,
          ]}
        >
          <ThemedText style={styles.feedbackText}>
            {isLastAnswerCorrect
              ? "Correct! Well done!"
              : `Incorrect. The correct answer was "${currentTarget}".`}
          </ThemedText>
        </ThemedView>
      )}
      <ThemedView style={[styles.container]}>
        <LetterSoundButton
          onPress={() => handleSelect(words[0])}
          size={90}
          selected={selectedWord === words[0]}
          disabled={showFeedback}
        >
          <ThemedText style={styles.buttonText}>{words[0]}</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
        <LetterSoundButton
          onPress={() => handleSelect(words[1])}
          size={90}
          selected={selectedWord === words[1]}
          disabled={showFeedback}
        >
          <ThemedText style={styles.buttonText}>{words[1]}</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
      </ThemedView>
      <ThemedView style={[styles.container]}>
        <LetterSoundButton
          onPress={() => handleSelect(words[2])}
          size={90}
          selected={selectedWord === words[2]}
          disabled={showFeedback}
        >
          <ThemedText style={styles.buttonText}>{words[2]}</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
        <LetterSoundButton
          onPress={() => handleSelect(words[3])}
          size={90}
          selected={selectedWord === words[3]}
          disabled={showFeedback}
        >
          <ThemedText style={styles.buttonText}>{words[3]}</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
      </ThemedView>
      <Pressable
        style={[
          styles.pressable,
          { opacity: selectedWord === null || showFeedback ? 0.5 : 1 },
          selectedWord !== null &&
            !showFeedback && {
              borderWidth: 2,
              borderColor: "blue",
            },
        ]}
        disabled={selectedWord === null || showFeedback}
        onPress={handleSubmit}
      >
        <ThemedText style={styles.submitButtonText}>
          {selectedWord ? `Submit "${selectedWord}"` : "Pick a word"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-evenly",
  },
  column: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
  text: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  targetSoundContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
  },
  pressable: {
    backgroundColor: "lightgreen",
    borderRadius: 10,
    marginTop: 15,
    padding: 15,
    paddingHorizontal: 25,
    minWidth: 150,
    alignItems: "center",
  },
  submitButtonText: {
    fontWeight: "500",
    fontSize: 16,
  },
  feedbackContainer: {
    padding: 0.1,
    borderRadius: 10,
    marginBottom: 15,
    width: "90%",
    alignItems: "center",
  },
  correctFeedback: {
    backgroundColor: "rgba(0, 200, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(0, 200, 0, 0.5)",
  },
  incorrectFeedback: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.3)",
  },
  feedbackText: {
    fontSize: 16,
    textAlign: "center",
    padding: 10,
  },
});

export default PictureButtonGrid;
