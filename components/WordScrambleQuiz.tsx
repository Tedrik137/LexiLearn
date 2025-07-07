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
import CircleCountdownTimer from "./CircleCountdownTimer";
import WordScrambleQuizResults from "./WordScrambleQuizResults";
import LetterSoundButton from "./LetterSoundButton";
import { IconSymbol } from "./ui/IconSymbol";

interface Props {
  maxQuestions?: number;
  isScreenFocused: boolean;
}

type Quiz = {
  currentQuestion: number;
  score: number;
  quizCompleted: boolean;
  quizMode: string;
  lastAnswerCorrect: boolean;
  showFeedback: boolean;
  scrambledWords: { scrambled: string; original: string }[];
};

const getUniqueScrambledWords = (
  words: { scrambled: string; original: string }[],
  count: number
) => {
  // Create a copy to avoid modifying the original array from the import
  const shuffled = [...words];

  // Fisher-Yates shuffle algorithm for an unbiased shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }

  // Return the first 'count' items from the shuffled array
  return shuffled.slice(0, count);
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
    lastAnswerCorrect: false,
    showFeedback: false,
    scrambledWords: [{ scrambled: "", original: "" }],
  });

  const [currentTargetWord, setCurrentTargetWord] = useState<string>("friend");
  const [currentScrambledWord, setCurrentScrambledWord] =
    useState<string>("erfidn");
  // State to track loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

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
      setupQuiz("practice");
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
      setIsPlaying(false);
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
      setIsPlaying(true);
    }
  }, [
    quiz.quizCompleted,
    quiz.score,
    language,
    maxQuestions,
    updateUserXP,
    isScreenFocused,
  ]);

  useEffect(() => {
    // This effect manages the visibility of the feedback message for incorrect answers.
    // It shows for 2 seconds and then disappears automatically.
    if (quiz.showFeedback && !quiz.lastAnswerCorrect) {
      const timer = setTimeout(() => {
        setQuiz((prev) => ({ ...prev, showFeedback: false }));
      }, 2000); // Hide after 2 seconds

      // Cleanup the timer if the component unmounts or dependencies change
      return () => clearTimeout(timer);
    }
  }, [quiz.showFeedback, quiz.lastAnswerCorrect]);

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selectedWord: string, direction: string) => {
    // Check if the answer is correct
    let isCorrect = selectedWord === currentTargetWord;

    if (direction === "rtl") {
      isCorrect =
        selectedWord === currentTargetWord.split("").reverse().join("");
    }

    // Queue state updates for score and feedback
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      score: isCorrect ? prevQuiz.score + 1 : prevQuiz.score,
      lastAnswerCorrect: isCorrect,
      // Show feedback immediately only in practice mode
      showFeedback: prevQuiz.quizMode === "practice",
    }));

    return isCorrect;
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
          currentQuestion: nextQuestionNumber, // Update question number to maxQuestions
        };
      } else {
        const nextWord = prevQuiz.scrambledWords[nextQuestionNumber];
        setCurrentTargetWord(nextWord.original);
        setCurrentScrambledWord(nextWord.scrambled);

        if (isScreenFocused && prevQuiz.quizMode === "practice") {
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
      const newWords = getUniqueScrambledWords(words, maxQuestions);

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

      if (isScreenFocused && newMode === "practice") {
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

  const timerComplete = () => {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      quizCompleted: true,
    }));
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
      <CircleCountdownTimer onComplete={timerComplete} isPlaying={isPlaying} />

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
              The unscrambled word will be played as audio before submission.
              You must unscramble the word to get the next word. This quiz is
              timed.
            </ThemedText>
          )}

          {quiz.quizMode === "test" && (
            <ThemedText style={styles.modeDescription}>
              Test Mode: Test your knowledge! No audio will be played before
              submission. This quiz is timed.
            </ThemedText>
          )}

          {currentScrambledWord && (
            <ThemedView style={styles.container}>
              {quiz.showFeedback && (
                <ThemedView
                  style={[
                    styles.feedbackContainer,
                    quiz.lastAnswerCorrect
                      ? styles.correctFeedback
                      : styles.incorrectFeedback,
                  ]}
                >
                  <ThemedText style={styles.feedbackText}>
                    {quiz.lastAnswerCorrect
                      ? `Correct: The word was: ${currentTargetWord}`
                      : `Incorrect! Please try again.`}
                  </ThemedText>
                </ThemedView>
              )}
              <ScrambledWordQuizGrid
                scrambledWord={currentScrambledWord}
                submitAnswer={handleAnswerSubmit}
                moveToNextQuestion={moveToNextQuestion}
              />

              {quiz.quizMode !== "test" && (
                <>
                  <LetterSoundButton
                    onPress={() => playSound(currentTargetWord, language)}
                    size={70}
                    selected={false}
                    disabled={quiz.showFeedback}
                  >
                    <IconSymbol size={24} name="speaker.3" color="white" />
                  </LetterSoundButton>
                  <ThemedText style={styles.helpText}>
                    Tap to hear the sound again
                  </ThemedText>
                </>
              )}
            </ThemedView>
          )}
        </>
      )}

      {quiz.quizCompleted && (
        <WordScrambleQuizResults
          score={quiz.score}
          maxQuestions={maxQuestions}
          setupQuiz={setupQuiz}
          quizMode={quiz.quizMode}
          scrambledWords={quiz.scrambledWords}
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
  quizHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
  feedbackContainer: {
    padding: 0.1,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 20,
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
    fontSize: 18,
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
  },
});
