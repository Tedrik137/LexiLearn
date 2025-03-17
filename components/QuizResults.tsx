import React from "react";
import { ThemedView } from "./ThemedView";
import Confetti from "./Confetti";
import { ThemedText } from "./ThemedText";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import CustomScrollView from "./CustomScrollView";

interface Props {
  quizMode: string;
  score: number;
  maxQuestions: number;
  quizWordPictures: [string, any][];
  answers: { question: string; userAnswer: string; correct: boolean }[];
  setupQuiz: () => void;
}

export default function QuizResults({
  setupQuiz,
  quizMode,
  score,
  maxQuestions,
  quizWordPictures,
  answers,
}: Props) {
  return (
    <ThemedView style={styles.resultContainer}>
      <Confetti />
      <ThemedText style={styles.resultTitle}>Quiz Complete!</ThemedText>
      <ThemedText style={styles.resultMode}>
        Mode: {quizMode === "practice" ? "Practice" : "Test"}
      </ThemedText>
      <ThemedText style={styles.reviewText}> Review Your Answers:</ThemedText>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true} // <-- Enables inner scroll behavior
        showsVerticalScrollIndicator={true} // Optional: Show scrollbar
      >
        {answers.map((answer, index) => (
          <ThemedView key={index} style={[styles.answerContainer]}>
            <ThemedText style={[styles.questionText]}>
              {index + 1}. {answer.question}
            </ThemedText>
            <ThemedText style={[styles.correctIndicator]}>
              {answer.correct ? "  ✅ " : "  ❌ "}
            </ThemedText>

            {/* Fixed-width container for incorrect answers (to align checkmarks) */}
            <ThemedView style={styles.feedbackContainer}>
              {!answer.correct && (
                <ThemedText style={styles.incorrectText}>
                  {" "}
                  (You chose: {answer.userAnswer})
                </ThemedText>
              )}
            </ThemedView>
            <Image
              style={[styles.resultsImage]}
              source={quizWordPictures[index][1]}
              contentFit="contain"
            />
          </ThemedView>
        ))}
      </ScrollView>

      <ThemedText style={styles.resultScore}>
        Your score: {score} out of {maxQuestions}
      </ThemedText>
      <Pressable style={styles.resetButton} onPress={() => setupQuiz()}>
        <ThemedText style={styles.resetButtonText}>Try Again</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultMode: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
  },
  resultScore: {
    fontSize: 20,
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: "blue",
    borderRadius: 10,
    padding: 15,
    paddingHorizontal: 25,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  answerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  resultsImage: {
    width: 44,
    height: 44,
  },
  scrollView: {
    maxHeight: 300, // Adjust height as needed
    width: "100%",
  },
  scrollContent: {
    alignItems: "flex-start",
    paddingBottom: 20,
    rowGap: 10,
  },
  questionText: {
    minWidth: 80, // Ensure questions align correctly
    textAlign: "left",
    flexShrink: 1, // Prevents text from overflowing
  },
  correctIndicator: {
    minWidth: 30, // Consistent width for check/cross
    textAlign: "center",
  },
  incorrectText: {
    flexShrink: 1, // Allows text to wrap if needed
    color: "red",
  },
  feedbackContainer: {
    minWidth: 150, // Ensures consistent spacing even if empty
  },
});
