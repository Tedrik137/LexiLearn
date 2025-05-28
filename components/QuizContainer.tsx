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
import { useAuthStore } from "@/stores/authStore";
import QuizResults from "./QuizResults";
import { letters } from "@/entities/letters";

interface Props {
  maxQuestions?: number;
  isScreenFocused: boolean;
}

type Quiz = {
  currentQuestion: number;
  score: number;
  quizCompleted: boolean;
  quizMode: string;
  showFeedback: boolean;
  lastAnswerCorrect: boolean;
  quizLetters: string[];
  answers: { question: string; userAnswer: string; correct: boolean }[];
};

export default function QuizContainer({
  maxQuestions = 5,
  isScreenFocused,
}: Props) {
  const [quiz, setQuiz] = useState<Quiz>({
    currentQuestion: 0,
    score: 0,
    quizCompleted: false,
    quizMode: "practice",
    showFeedback: false,
    lastAnswerCorrect: false,
    quizLetters: [],
    answers: [],
  });

  const [currentTargetLetter, setCurrentTargetLetter] = useState<string>("a");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateUserXP = useAuthStore((state) => state.updateUserXP);
  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU"; // Default to English if no language is selected
  const languageLetters = letters[language as LanguageCode] || [];

  // Initialize the quiz when component mounts
  useEffect(() => {
    if (isScreenFocused) {
      console.log(
        `QuizContainer: Effect for setupQuiz. Screen focused. Language: ${language}`
      );
      setupQuiz();
    } else {
      console.log(
        `QuizContainer: Effect for setupQuiz. Screen NOT focused. Language: ${language}. Skipping setup.`
      );
    }
  }, [letters, isScreenFocused]);

  useEffect(() => {
    if (!isScreenFocused) {
      console.log(
        "QuizContainer: XP update effect skipped, screen not focused."
      );
      return;
    }

    if (quiz.quizCompleted) {
      // Update user XP when the quiz is completed
      // Calculate XP based on the score from the latest state (prevQuiz.score)
      const xpGained =
        quiz.quizMode === "practice"
          ? Math.floor((quiz.score / maxQuestions) * 100)
          : Math.floor((quiz.score / maxQuestions) * 250);

      if (xpGained > 0) {
        console.log(
          `Quiz completed. Gained ${xpGained} XP for language ${language}.`
        );
        try {
          updateUserXP(xpGained)
            .then(() => {
              console.log("User XP updated successfully.");
            })
            .catch((error) => {
              console.error("Error updating user XP:", error);
            });
        } catch (error) {
          console.error("Error updating user XP:", error);
        }
      }
    } else {
      console.log(`Quiz incomplete. Current score: ${quiz.score}`);
    }
  }, [
    quiz.quizCompleted,
    quiz.score,
    language,
    maxQuestions,
    updateUserXP,
    isScreenFocused,
  ]);

  // Select a random letter from the available letters
  const selectRandomLetter = () => {
    if (languageLetters.length > 0)
      return languageLetters[
        Math.floor(Math.random() * languageLetters.length)
      ];
    return "a";
  };

  const createNewQuiz = () => {
    return new Array(maxQuestions).fill(null).map(selectRandomLetter);
  };

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selectedLetter: string) => {
    // Check if the answer is correct
    const isCorrect = selectedLetter === currentTargetLetter;
    // Queue state updates for score and feedback
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      score: isCorrect ? prevQuiz.score + 1 : prevQuiz.score,
      lastAnswerCorrect: isCorrect,
      // Show feedback immediately only in practice mode
      showFeedback: prevQuiz.quizMode === "practice",
      answers: [
        ...prevQuiz.answers,
        {
          question: currentTargetLetter,
          userAnswer: selectedLetter,
          correct: isCorrect,
        },
      ],
    }));

    if (quiz.quizMode === "practice") {
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
    // Use functional update to ensure we operate on the latest state
    setQuiz((prevQuiz) => {
      const nextQuestionNumber = prevQuiz.currentQuestion + 1;

      if (nextQuestionNumber >= maxQuestions) {
        // --- Quiz Complete ---
        // Return final state
        return {
          ...prevQuiz,
          quizCompleted: true,
          showFeedback: false, // Ensure feedback is off on results screen
          currentQuestion: nextQuestionNumber, // Update question number to maxQuestions
        };
      } else {
        const nextTargetLetter = quiz.quizLetters[nextQuestionNumber];
        setCurrentTargetLetter(nextTargetLetter);

        if (isScreenFocused) {
          console.log(
            `QuizContainer: Playing sound for next question: ${nextTargetLetter}, lang: ${language}`
          );
          // Play the sound for the next question
          playSound(nextTargetLetter, language);
        }

        return {
          ...prevQuiz,
          currentQuestion: nextQuestionNumber,
          showFeedback: false, // Hide feedback for the next question
        };
      }
    });
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    if (!isScreenFocused && !isLoading) {
      console.log(
        "QuizContainer: setupQuiz called, but screen not focused. Aborting setup."
      );
      return;
    }
    setIsLoading(true);
    console.log(
      `QuizContainer: setupQuiz initiated. Mode: ${
        newMode || quiz.quizMode
      }, Lang: ${language}`
    );

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
        answers: [],
      }));

      setCurrentTargetLetter(newLetters[0]);
      setIsLoading(false);
      console.log(
        `QuizContainer: Quiz setup complete. First letter: ${newLetters[0]}`
      );

      if (isScreenFocused) {
        // Play sound only if screen is focused
        console.log(
          `QuizContainer: Playing sound for first letter: ${newLetters[0]}, lang: ${language}`
        );
        playSound(newLetters[0], language as LanguageCode);
      }
    }, delay);
  };

  const toggleQuizMode = () => {
    setupQuiz(quiz.quizMode === "practice" ? "test" : "practice", 250);
  };

  if (!isScreenFocused && !quiz.quizCompleted) {
    // If the screen is not focused and the quiz isn't completed (i.e., results aren't being shown)
    // you might want to render nothing or a placeholder to prevent interaction with a non-focused quiz.
    // This is optional and depends on desired UX.
    console.log(
      "QuizContainer: Screen not focused, rendering minimal or null."
    );
    return null; // Or a lightweight placeholder
  }

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
      {!quiz.quizCompleted && (
        <>
          <ThemedView style={styles.modeToggleContainer}>
            <Pressable
              style={[
                styles.modeButton,
                quiz.quizMode === "practice" && styles.activeMode,
              ]}
              onPress={() => quiz.quizMode !== "practice" && toggleQuizMode()}
            >
              <ThemedText style={styles.modeButtonText}>
                Practice Mode
              </ThemedText>
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
              Practice Mode: Learn the letter sounds by playing each one.
              Feedback will be shown after each answer.
            </ThemedText>
          )}

          {quiz.quizMode === "test" && (
            <ThemedText style={styles.modeDescription}>
              Test Mode: Test your knowledge! You can only hear the target
              sound, not individual letters.
            </ThemedText>
          )}

          <LetterSoundGrid
            targetLetter={currentTargetLetter}
            onAnswerSubmit={handleAnswerSubmit}
            quizMode={quiz.quizMode}
            showFeedback={quiz.showFeedback}
            isLastAnswerCorrect={quiz.lastAnswerCorrect}
            currentQuestion={quiz.currentQuestion}
          />
        </>
      )}

      {quiz.quizCompleted &&
        quiz.quizLetters.length === quiz.answers.length && (
          <QuizResults
            setupQuiz={setupQuiz}
            maxQuestions={maxQuestions}
            quizMode={quiz.quizMode}
            score={quiz.score}
            quizLetters={quiz.quizLetters}
            answers={quiz.answers}
          />
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
