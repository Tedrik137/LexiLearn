import React, { useEffect, useState } from "react";
import { ThemedView } from "./ThemedView";
import Confetti from "./Confetti";
import { ThemedText } from "./ThemedText";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import LessonHistoryService from "@/services/lessonHistoryService";

interface Props {
  quizMode: string;
  score: number;
  maxQuestions: number;
  answers: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
  }[];
  setupQuiz: () => void;
}

export default function GrammarQuizResults({
  setupQuiz,
  quizMode,
  score,
  maxQuestions,
  answers,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const language = useAuthStore((state) => state.selectedLanguage);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const performSave = async () => {
      if (!user || !language) {
        console.warn(
          "QuizResults: User or language not available, cannot save results."
        );
        return;
      }

      setSaving(true);
      try {
        const result = await LessonHistoryService.addLessonEntry({
          userId: user.uid,
          language: language,
          name: "Fill-in-the-Blank Grammar Quiz",
          score: (score / maxQuestions) * 100,
          mode: quizMode === "practice" ? "Practice" : "Test",
          difficulty: "Intermediate",
        });

        if (result.success) {
          console.log("Quiz results saved successfully:", result);
        } else {
          console.error("Failed to save quiz results:", result.error);
        }
      } catch (error) {
        console.error("Error saving quiz results:", error);
      } finally {
        setSaving(false);
      }
    };

    performSave();
  }, []);

  return (
    <ThemedView style={styles.resultContainer}>
      <ThemedText style={styles.resultTitle}>Quiz Complete!</ThemedText>
      {saving ? (
        <ThemedText style={{ textAlign: "center", marginBottom: 10 }}>
          Saving your results...
        </ThemedText>
      ) : (
        <ThemedText style={{ textAlign: "center", marginBottom: 10 }}>
          Quiz results saved. See them in your profile lesson history.
        </ThemedText>
      )}
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
          <ThemedView key={index} style={styles.answerBlock}>
            <ThemedText style={styles.questionText}>
              {index + 1}. {answer.question}
            </ThemedText>

            <ThemedView style={styles.userAnswerRow}>
              <ThemedText
                style={
                  answer.correct ? styles.correctText : styles.incorrectText
                }
              >
                Your answer: {answer.userAnswer}
              </ThemedText>
              <ThemedText>{answer.correct ? "✅" : "❌"}</ThemedText>
            </ThemedView>

            {!answer.correct && (
              <ThemedText style={styles.correctAnswerText}>
                Correct answer: {answer.correctAnswer}
              </ThemedText>
            )}
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
    flex: 1,
    alignItems: "center",
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
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  resultScore: {
    fontSize: 20,
    marginBottom: 20,
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
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // --- NEW STYLES FOR STACKED LAYOUT ---
  answerBlock: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userAnswerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  incorrectText: {
    color: "#D32F2F", // A darker red for better readability
    fontSize: 15,
    flex: 1, // Allow text to wrap
  },
  correctText: {
    color: "#388E3C", // A darker green
    fontSize: 15,
    flex: 1,
  },
  correctAnswerText: {
    marginTop: 6,
    color: "#555",
    fontStyle: "italic",
  },
});
