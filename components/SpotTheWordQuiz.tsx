import React, { useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import { LanguageCode } from "@/types/languages";

import SelectableSentence from "./SelectableSentence";
import LetterSoundButton from "./LetterSoundButton";
import { playSound } from "@/utils/audioUtils";
import { IconSymbol } from "./ui/IconSymbol";
import { sentences } from "@/entities/sentences";
import { useAuthStore } from "@/stores/authStore";
import SpotTheWordQuizResults from "./SpotTheWordQuizResults";

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
  quizSentences: string[];
  answers: { question: string; userAnswer: string; correct: boolean }[];
};

export default function SpotTheWordQuiz({
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
    quizSentences: ["This is my beautful long long long sentence."],
    answers: [],
  });

  const updateUserXP = useAuthStore((state) => state.updateUserXP);
  const [currentTarget, setCurrentTarget] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuestionTransitioning, setIsQuestionTransitioning] = useState(false);
  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU"; // Default to English if no language is selected

  // Initialize the quiz when component mounts
  useEffect(() => {
    if (isScreenFocused) {
      console.log(
        `SpotTheWordQuiz: Effect for setupQuiz. Screen focused. Language: ${language}`
      );
      setupQuiz();
    } else {
      console.log(
        `SpotTheWordQuiz: Effect for setupQuiz. Screen NOT focused. Language: ${language}. Skipping setup.`
      );
    }
  }, [sentences, isScreenFocused]);

  useEffect(() => {
    if (!isScreenFocused) {
      console.log(
        "SpotTheWordQuiz: XP update effect skipped, screen not focused."
      );
      return;
    }

    if (quiz.quizCompleted) {
      // Update user XP when the quiz is completed
      // Calculate XP based on the score from the latest state (prevQuiz.score)
      const xpGained = Math.floor((quiz.score / maxQuestions) * 100);

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
      console.log(`Quiz incompleted. Current score: ${quiz.score}`);
    }
  }, [
    quiz.quizCompleted,
    quiz.score,
    maxQuestions,
    updateUserXP,
    language,
    isScreenFocused,
  ]);

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selectedWord: string) => {
    // Check if the answer is correct
    const isCorrect = selectedWord === currentTarget;

    if (isQuestionTransitioning) return;

    setIsQuestionTransitioning(true);

    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      score: isCorrect ? prevQuiz.score + 1 : prevQuiz.score,
      lastAnswerCorrect: isCorrect,
      showFeedback: prevQuiz.quizMode === "practice",
      answers: [
        ...prevQuiz.answers,
        {
          question: currentTarget,
          userAnswer: selectedWord,
          correct: isCorrect,
        },
      ],
    }));

    if (quiz.quizMode === "practice") {
      // Move to next question after a delay
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500); // 1-second delay to show feedback
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
        const newWord = selectRandomWord(
          quiz.quizSentences[nextQuestionNumber]
        );

        if (isScreenFocused) {
          console.log(
            `SpotTheWordQuiz: Playing sound for next question: ${newWord}, lang: ${language}`
          );
          // Play the sound for the next question
          playSound(newWord, language);
        }

        return {
          ...prevQuiz,
          currentQuestion: nextQuestionNumber,
          showFeedback: false, // Hide feedback for the next question
        };
      }
    });

    setIsQuestionTransitioning(false);
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    if (!isScreenFocused && !isLoading) {
      console.log(
        "SpotTheWordQuiz: setupQuiz called, but screen not focused. Aborting setup."
      );
      return;
    }
    setIsLoading(true);
    console.log(
      `SpotTheWordQuiz: setupQuiz initiated. Mode: ${
        newMode || quiz.quizMode
      }, Lang: ${language}`
    );
    setTimeout(() => {
      const newSentences = createNewQuiz();

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizMode: newMode ?? prevQuiz.quizMode,
        currentQuestion: 0,
        score: 0,
        showFeedback: false,
        lastAnswerCorrect: false,
        quizCompleted: false,
        quizSentences: newSentences,
        answers: [],
      }));

      const newWord = selectRandomWord(newSentences[0]);
      setIsLoading(false);
      console.log(
        `SpotTheWordQuiz: Quiz setup complete. First letter: ${newWord}`
      );
      if (isScreenFocused) {
        // Play sound only if screen is focused
        console.log(
          `SpotTheWordQuiz: Playing sound for first letter: ${newWord}, lang: ${language}`
        );
        playSound(newWord, language as LanguageCode);
      }
    }, delay);
  };

  // select random sentence from sentences
  const selectRandomSentence = () => {
    if (sentences && sentences.length > 0)
      return sentences[Math.floor(Math.random() * sentences.length)];
    return "This is my beautiful long long long sentence.";
  };

  // make an array of size maxQuestions of random questions
  const createNewQuiz = () => {
    return new Array(maxQuestions).fill(null).map(selectRandomSentence);
  };

  const selectRandomWord = (sentence: string) => {
    const words = sentence.split(" ");
    const index = Math.floor(Math.random() * (words.length - 1));
    setCurrentTarget(words[index]);
    return words[index];
  };

  const toggleQuizMode = () => {
    setupQuiz(quiz.quizMode === "practice" ? "test" : "practice", 250);
  };

  if (!isScreenFocused && !quiz.quizCompleted) {
    // If the screen is not focused and the quiz isn't completed (i.e., results aren't being shown)
    // you might want to render nothing or a placeholder to prevent interaction with a non-focused quiz.
    // This is optional and depends on desired UX.
    console.log(
      "SpotTheWordQuiz: Screen not focused, rendering minimal or null."
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
              Tap the word in a sentence that matches an audio cue. Replay the
              audio cue and sentence as many times as you want. Feedback will be
              shown after each answer.
            </ThemedText>
          )}

          {quiz.quizMode === "test" && (
            <ThemedText style={styles.modeDescription}>
              Test Mode: Test your knowledge! You won't receive feedback till
              the end.
            </ThemedText>
          )}

          {currentTarget && (
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
                      ? "Correct! Well done!"
                      : `Incorrect. The correct answer was "${currentTarget}".`}
                  </ThemedText>
                </ThemedView>
              )}
              <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                Match the audio cue with the word in the sentence:
              </ThemedText>
              <SelectableSentence
                sentence={quiz.quizSentences[quiz.currentQuestion].split(" ")}
                handleAnswerSubmit={handleAnswerSubmit}
                showFeedback={quiz.showFeedback}
                quizMode={quiz.quizMode}
                currentTarget={currentTarget}
                isQuestionTransitioning={isQuestionTransitioning}
              />
            </ThemedView>
          )}
        </>
      )}

      {quiz.quizCompleted &&
        quiz.answers.length === quiz.quizSentences.length && (
          <SpotTheWordQuizResults
            setupQuiz={setupQuiz}
            quizMode={quiz.quizMode}
            score={quiz.score}
            maxQuestions={maxQuestions}
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
    justifyContent: "center",
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
    marginBottom: 20,
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
