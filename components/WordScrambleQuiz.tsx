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
import { localizedScrambledWords } from "@/entities/scrambledWords";
import ScrambledWord from "./ScrambledWord";
import { localizedLanguageProperties } from "@/entities/languageProperties";
import UnscrambledAreaBoxes from "./UnscrambledAreaBoxes";
import ScrambledWordQuizGrid from "./ScrambledWordQuizGrid";

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
  scrambledWords: { scrambled: string; original: string }[];
};

export default function WordScrambleQuiz({
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
    scrambledWords: [{ scrambled: "", original: "" }],
  });

  const [currentTargetWord, setCurrentTargetWord] = useState<string>("friend");
  const [currentScrambledWord, setCurrentScrambledWord] =
    useState<string>("erfidn");
  // State to track loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateUserXP = useAuthStore((state) => state.updateUserXP);
  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU"; // Default to English if no language is selected
  const words =
    localizedScrambledWords[language as keyof typeof localizedScrambledWords] ||
    [];

  // Initialize the quiz when component mounts
  useEffect(() => {
    if (isScreenFocused) {
      console.log(
        `WordScrambleQuiz: Effect for setupQuiz. Screen focused. Language: ${language}`
      );
      setupQuiz();
    } else {
      console.log(
        `WordScrambleQuiz: Effect for setupQuiz. Screen NOT focused. Language: ${language}. Skipping setup.`
      );
    }
  }, [words, isScreenFocused]);

  useEffect(() => {
    if (!isScreenFocused) {
      console.log(
        "WordScrambleQuiz: XP update effect skipped, screen not focused."
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
          updateUserXP(xpGained).then(() => {
            console.log("User XP updated successfully.");
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
  const selectRandomWord = () => {
    if (words.length > 0)
      return words[Math.floor(Math.random() * words.length)];
    return { scrambled: "erfidn", original: "friend" };
  };

  const createNewQuiz = () => {
    return new Array(maxQuestions).fill(null).map(selectRandomWord);
  };

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selectedWord: string) => {
    // Check if the answer is correct
    const isCorrect = selectedWord === currentTargetWord;
    // Queue state updates for score and feedback
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      score: isCorrect ? prevQuiz.score + 1 : prevQuiz.score,
      lastAnswerCorrect: isCorrect,
      // Show feedback immediately only in practice mode
      showFeedback: prevQuiz.quizMode === "practice",
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
        const nextWord = quiz.scrambledWords[nextQuestionNumber];
        setCurrentTargetWord(nextWord.original);
        setCurrentScrambledWord(nextWord.scrambled);

        if (isScreenFocused) {
          console.log(
            `WordScrambleQuiz: Playing sound for next question: ${nextWord.original}, lang: ${language}`
          );
          // Play the sound for the next question
          playSound(nextWord.original, language);
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
        "WordScrambleQuiz: setupQuiz called, but screen not focused. Aborting setup."
      );
      return;
    }
    setIsLoading(true);
    console.log(
      `WordScrambleQuiz: setupQuiz initiated. Mode: ${
        newMode || quiz.quizMode
      }, Lang: ${language}`
    );

    setTimeout(() => {
      const newWords = createNewQuiz();

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizMode: newMode ?? prevQuiz.quizMode,
        currentQuestion: 0,
        score: 0,
        showFeedback: false,
        lastAnswerCorrect: false,
        quizCompleted: false,
        scrambledWords: newWords,
      }));

      setCurrentTargetWord(newWords[0].original);
      setCurrentScrambledWord(newWords[0].scrambled);
      setIsLoading(false);
      console.log(
        `WordScrambleQuiz: Quiz setup complete. First letter: ${newWords[0].original}, lang: ${language}`
      );

      if (isScreenFocused) {
        // Play sound only if screen is focused
        console.log(
          `WordScrambleQuiz: Playing sound for first letter: ${newWords[0].original}, lang: ${language}`
        );
        playSound(newWords[0].original, language);
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
      "WordScrambleQuiz: Screen not focused, rendering minimal or null."
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
              Practice Mode: Unscramble the letters to form the correct word.
              The unscrambled word will be played as audio before and after
              submission. Feedback will be shown after each answer.
            </ThemedText>
          )}

          {quiz.quizMode === "test" && (
            <ThemedText style={styles.modeDescription}>
              Test Mode: Test your knowledge! No audio will be played before
              submission. You will only see feedback after the quiz is
              completed.
            </ThemedText>
          )}

          <ScrambledWordQuizGrid scrambledWord={currentScrambledWord} />
        </>
      )}

      {quiz.quizCompleted && (
        <ThemedText style={styles.modeDescription}>
          Quiz Completed! Review your results below.
        </ThemedText>
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
