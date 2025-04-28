// QuizContainer.tsx
import { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import LetterSoundGrid from "./LetterSoundGrid";
import { LanguageCode } from "@/types/languages";
import { playSound } from "@/utils/audioUtils";

interface Props {
  letters: string[];
  language: LanguageCode;
  maxQuestions?: number;
}

type Quiz = {
  currentQuestion: number;
  score: number;
  quizCompleted: boolean;
  quizMode: string;
  showFeedback: boolean;
  lastAnswerCorrect: boolean;
  quizLetters: string[];
};

export default function QuizContainer({
  letters,
  language,
  maxQuestions = 5,
}: Props) {
  const [quiz, setQuiz] = useState<Quiz>({
    currentQuestion: 0,
    score: 0,
    quizCompleted: false,
    quizMode: "practice",
    showFeedback: false,
    lastAnswerCorrect: false,
    quizLetters: [],
  });
  const [currentTargetLetter, setCurrentTargetLetter] = useState<string>("a");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize the quiz when component mounts
  useEffect(() => {
    setupQuiz();
  }, [letters]);

  // Select a random letter from the available letters
  const selectRandomLetter = () => {
    if (letters.length > 0)
      return letters[Math.floor(Math.random() * letters.length)];
    return "a";
  };

  const createNewQuiz = () => {
    return new Array(maxQuestions).fill(null).map(selectRandomLetter);
  };

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selectedLetter: string) => {
    // Check if the answer is correct
    const isCorrect = selectedLetter === currentTargetLetter;
    if (isCorrect) {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        score: prevQuiz.score + 1,
      }));
    }

    if (quiz.quizMode === "practice") {
      // Show feedback in practice mode
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        lastAnswerCorrect: isCorrect,
        showFeedback: true,
      }));

      // Move to next question after a delay
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000); // 2-second delay to show feedback
    } else {
      // In test mode, immediately move to the next question
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    const nextQuestionNumber = quiz.currentQuestion + 1;

    if (nextQuestionNumber >= maxQuestions) {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizCompleted: true,
        showFeedback: false,
      }));
    } else {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        currentQuestion: nextQuestionNumber,
        showFeedback: false,
      }));
      const nextTargetLetter = quiz.quizLetters[nextQuestionNumber];
      setCurrentTargetLetter(nextTargetLetter);

      // Play the sound for the next question
      playSound(nextTargetLetter, language);
    }
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    setIsLoading(true);

    setTimeout(() => {
      const newLetters = createNewQuiz();

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizMode: newMode ?? prevQuiz.quizMode,
        currentQuestion: 0,
        score: 0,
        showFeedback: false,
        lastAnswerCorrect: false,
        quizCompleted: false,
        quizLetters: newLetters,
      }));

      setCurrentTargetLetter(newLetters[0]);
      setIsLoading(false);

      // Play the sound after the quiz is set up
      playSound(newLetters[0], language);
    }, delay);
  };

  const resetQuiz = () => {
    setupQuiz();
  };

  const toggleQuizMode = () => {
    setupQuiz(quiz.quizMode === "practice" ? "test" : "practice", 250);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>
          {quiz.quizMode === "practice"
            ? "Setting up Test mode..."
            : "Setting up Practice mode..."}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <QuizProgressBar
        maxSteps={maxQuestions}
        currentStep={quiz.currentQuestion}
        marginTop={10}
      />
      <ThemedView style={styles.modeToggleContainer}>
        <Pressable
          style={[
            styles.modeButton,
            quiz.quizMode === "practice" && styles.activeMode,
          ]}
          onPress={() => quiz.quizMode !== "practice" && toggleQuizMode()}
        >
          <ThemedText style={styles.modeButtonText}>Practice Mode</ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.modeButton,
            quiz.quizMode === "test" && styles.activeMode,
          ]}
          onPress={() => quiz.quizMode !== "test" && toggleQuizMode()}
        >
          <ThemedText style={styles.modeButtonText}>Test Mode</ThemedText>
        </Pressable>
      </ThemedView>
      {quiz.quizMode === "practice" && (
        <ThemedText style={styles.modeDescription}>
          Practice Mode: Learn the letter sounds by playing each one. Feedback
          will be shown after each answer.
        </ThemedText>
      )}

      {quiz.quizMode === "test" && (
        <ThemedText style={styles.modeDescription}>
          Test Mode: Test your knowledge! You can only hear the target sound,
          not individual letters.
        </ThemedText>
      )}

      {!quiz.quizCompleted ? (
        <>
          <LetterSoundGrid
            letters={letters}
            language={language}
            targetLetter={currentTargetLetter}
            onAnswerSubmit={handleAnswerSubmit}
            quizMode={quiz.quizMode}
            showFeedback={quiz.showFeedback}
            isLastAnswerCorrect={quiz.lastAnswerCorrect}
            currentQuestion={quiz.currentQuestion}
          />
        </>
      ) : (
        <ThemedView style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>Quiz Complete!</ThemedText>
          <ThemedText style={styles.resultMode}>
            Mode: {quiz.quizMode === "practice" ? "Practice" : "Test"}
          </ThemedText>
          <ThemedText style={styles.resultScore}>
            Your score: {quiz.score} out of {maxQuestions}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
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
    marginBottom: 30,
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
