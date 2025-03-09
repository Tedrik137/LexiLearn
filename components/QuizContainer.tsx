// QuizContainer.tsx
import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import LetterSoundGrid from "./LetterSoundGrid";
import { LanguageCode } from "@/types/soundTypes";

type QuizMode = "practice" | "test";

interface Props {
  letters: string[];
  language: LanguageCode;
  maxQuestions?: number;
}

export default function QuizContainer({
  letters,
  language,
  maxQuestions = 5,
}: Props) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [currentTargetLetter, setCurrentTargetLetter] = useState<string>("a");
  const [quizMode, setQuizMode] = useState<QuizMode>("practice");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean>(false);

  // Reset or initialize the quiz
  useEffect(() => {
    resetQuiz();
  }, [letters, quizMode]);

  // Select a random letter from the available letters
  const selectRandomLetter = () => {
    if (letters.length > 0) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      return letters[randomIndex];
    }
    return "a"; // Fallback
  };

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selectedLetter: string) => {
    // Check if the answer is correct
    const isCorrect = selectedLetter === currentTargetLetter;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    if (quizMode === "practice") {
      // Show feedback in practice mode
      setLastAnswerCorrect(isCorrect);
      setShowFeedback(true);

      // Move to next question after a delay
      setTimeout(() => {
        moveToNextQuestion();
        setShowFeedback(false);
      }, 2000); // 2-second delay to show feedback
    } else {
      // In test mode, immediately move to the next question
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    const nextQuestionNumber = currentQuestion + 1;
    setCurrentQuestion(nextQuestionNumber);

    if (nextQuestionNumber >= maxQuestions) {
      setQuizCompleted(true);
    } else {
      setCurrentTargetLetter(selectRandomLetter());
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setShowFeedback(false);
    setCurrentTargetLetter(selectRandomLetter());
  };

  const toggleQuizMode = () => {
    setQuizMode((prevMode) => (prevMode === "practice" ? "test" : "practice"));
    // Quiz will be reset by the useEffect that depends on quizMode
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.modeToggleContainer}>
        <Pressable
          style={[
            styles.modeButton,
            quizMode === "practice" && styles.activeMode,
          ]}
          onPress={() => quizMode !== "practice" && toggleQuizMode()}
        >
          <ThemedText style={styles.modeButtonText}>Practice Mode</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.modeButton, quizMode === "test" && styles.activeMode]}
          onPress={() => quizMode !== "test" && toggleQuizMode()}
        >
          <ThemedText style={styles.modeButtonText}>Test Mode</ThemedText>
        </Pressable>
      </ThemedView>

      <QuizProgressBar maxSteps={maxQuestions} currentStep={currentQuestion} />

      {!quizCompleted ? (
        <>
          <LetterSoundGrid
            letters={letters}
            language={language}
            targetLetter={currentTargetLetter}
            onAnswerSubmit={handleAnswerSubmit}
            canPlayLetterSounds={quizMode === "practice"}
            showFeedback={showFeedback}
            isLastAnswerCorrect={lastAnswerCorrect}
          />

          {quizMode === "practice" && (
            <ThemedText style={styles.modeDescription}>
              Practice Mode: Learn the letter sounds by playing each one.
              Feedback will be shown after each answer.
            </ThemedText>
          )}

          {quizMode === "test" && (
            <ThemedText style={styles.modeDescription}>
              Test Mode: Test your knowledge! You can only hear the target
              sound, not individual letters.
            </ThemedText>
          )}
        </>
      ) : (
        <ThemedView style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>Quiz Complete!</ThemedText>
          <ThemedText style={styles.resultMode}>
            Mode: {quizMode === "practice" ? "Practice" : "Test"}
          </ThemedText>
          <ThemedText style={styles.resultScore}>
            Your score: {score} out of {maxQuestions}
          </ThemedText>
          <Pressable style={styles.resetButton} onPress={resetQuiz}>
            <ThemedText style={styles.resetButtonText}>Try Again</ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  modeToggleContainer: {
    flexDirection: "row",
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  activeMode: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    fontWeight: "500",
    color: "#333",
  },
  modeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultMode: {
    fontSize: 16,
    marginBottom: 10,
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
});
