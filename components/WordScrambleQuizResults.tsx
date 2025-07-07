import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Pressable } from "react-native";
import { playSound } from "@/utils/audioUtils";
import { useAuthStore } from "@/stores/authStore";
import { FontAwesome } from "@expo/vector-icons";
import { localizedLanguageProperties } from "@/entities/languageProperties";
import { IconSymbol } from "./ui/IconSymbol";

interface Props {
  score: number;
  maxQuestions: number;
  setupQuiz: (mode: string, delay?: number) => void;
  quizMode: string;
  scrambledWords: { scrambled: string; original: string }[];
}

const WordScrambleQuizResults = ({
  score,
  maxQuestions,
  setupQuiz,
  quizMode,
  scrambledWords,
}: Props) => {
  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU";

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Quiz Complete!</ThemedText>
      <ThemedText style={styles.subtitle}>
        Quiz results saved. See them in your profile lesson history.
      </ThemedText>

      <ThemedView style={styles.reviewSection}>
        <ThemedText style={styles.mode}>
          Mode:{" "}
          {`${quizMode.slice(0, 1).toLocaleUpperCase()}${quizMode.slice(1)}`}
        </ThemedText>
        <ThemedText style={styles.reviewTitle}>Review Your Answers:</ThemedText>
        {scrambledWords.map((word, index) => (
          <ThemedView key={index} style={styles.answerRow}>
            <ThemedText style={[styles.answerText, styles.scrambledWord]}>
              {localizedLanguageProperties[language!].direction === "ltr"
                ? `${index + 1}. ${
                    score >= index + 1 ? word.scrambled : "****"
                  }`
                : `${score >= index + 1 ? word.scrambled : "****"} .${
                    index + 1
                  }`}
            </ThemedText>

            <Pressable
              onPress={() => playSound(word.original, language)}
              disabled={score < index + 1}
            >
              <IconSymbol
                name={score >= index + 1 ? "speaker.3" : "speaker.slash.fill"}
                color="green"
              ></IconSymbol>
            </Pressable>

            <ThemedText style={[styles.answerText, styles.originalWord]}>
              {`${score >= index + 1 ? word.original : "****"}`}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedText style={styles.finalMessage}>
        {score !== maxQuestions
          ? "The timer ran out. You unscrambled some words correctly, but not all. Keep practicing!"
          : `Great job! You unscrambled ${score} out of ${maxQuestions} words correctly!`}
      </ThemedText>

      <Pressable
        style={styles.tryAgainButton}
        onPress={() => setupQuiz(quizMode, 250)}
      >
        <ThemedText style={styles.tryAgainButtonText}>Try Again</ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20, // Fixes the button being cut off
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  reviewSection: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  mode: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%",
    backgroundColor: "none",
  },
  answerText: {
    fontSize: 16,
  },
  scrambledWord: {
    flex: 2, // Assign flex to ensure consistent width
    textAlign: "left",
  },
  originalWord: {
    flex: 2, // Assign flex to ensure consistent width
    textAlign: "left",
    fontWeight: "bold",
    marginLeft: 15,
  },
  finalMessage: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 25,
    textAlign: "center",
  },
  tryAgainButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  tryAgainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default WordScrambleQuizResults;
