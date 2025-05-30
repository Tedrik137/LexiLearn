// LetterSoundGrid.tsx
import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";
import LetterSoundButton from "./LetterSoundButton";
import { LanguageCode } from "@/types/languages";
import { playSound } from "@/utils/audioUtils";
import { Pressable } from "react-native";
import { useState, useEffect } from "react";
import { letters } from "@/entities/letters";
import { useAuthStore } from "@/stores/authStore";

interface Props {
  targetLetter: string;
  onAnswerSubmit: (selectedLetter: string) => void;
  showFeedback: boolean;
  isLastAnswerCorrect: boolean;
  currentQuestion: number;
  quizMode: string;
}

export default function LetterSoundGrid({
  targetLetter,
  onAnswerSubmit,
  showFeedback,
  isLastAnswerCorrect,
  currentQuestion,
  quizMode,
}: Props) {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const canPlayLetterSounds = quizMode === "practice";
  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU"; // Default to English if no language is selected
  const languageLetters = letters[language as LanguageCode] || [];

  useEffect(() => {
    setSelectedLetter(null);
  }, [currentQuestion, quizMode]);

  const handleSelect = (letter: string) => {
    // Only play the sound in practice mode
    if (canPlayLetterSounds) {
      playSound(letter, language);
    }
    setSelectedLetter(letter);
  };

  const handleSubmit = () => {
    if (selectedLetter === null) return;
    onAnswerSubmit(selectedLetter);
  };

  return (
    <ThemedView style={styles.column}>
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
              : `Incorrect. The correct answer was "${targetLetter}".`}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.container}>
        {languageLetters.map((letter) => (
          <LetterSoundButton
            key={letter}
            onPress={() => handleSelect(letter)}
            size={45}
            selected={selectedLetter === letter}
            disabled={showFeedback}
          >
            <ThemedText style={styles.buttonText}>{letter}</ThemedText>
            {canPlayLetterSounds && (
              <IconSymbol size={16} name="speaker.3" color="white" />
            )}
          </LetterSoundButton>
        ))}
      </ThemedView>

      <ThemedText style={[styles.text, { marginBottom: 15 }]}>
        Which sound is this?
      </ThemedText>

      <ThemedView style={styles.targetSoundContainer}>
        <LetterSoundButton
          onPress={() => playSound(targetLetter, language)}
          size={80}
          selected={false}
          disabled={showFeedback}
        >
          <IconSymbol size={24} name="speaker.3" color="white" />
        </LetterSoundButton>
        <ThemedText style={styles.helpText}>
          Tap to hear the sound again
        </ThemedText>
      </ThemedView>

      <Pressable
        style={[
          styles.pressable,
          { opacity: selectedLetter === null || showFeedback ? 0.5 : 1 },
          selectedLetter !== null &&
            !showFeedback && {
              borderWidth: 2,
              borderColor: "blue",
            },
        ]}
        disabled={selectedLetter === null || showFeedback}
        onPress={handleSubmit}
      >
        <ThemedText style={styles.submitButtonText}>
          {selectedLetter ? `Submit  "${selectedLetter}"` : "Pick a letter"}
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
    marginBottom: 30,
    width: "100%",
    paddingHorizontal: 10,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
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
