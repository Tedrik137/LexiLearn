import React, { useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import { LanguageCode } from "@/types/soundTypes";

import SelectableSentence from "./SelectableSentence";
import LetterSoundButton from "./LetterSoundButton";
import { playSound } from "@/utils/audioUtils";
import { IconSymbol } from "./ui/IconSymbol";
import { sentences } from "@/entities/sentences";

interface Props {
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
  quizSentences: string[];
  answers: { question: string; userAnswer: string; correct: boolean }[];
};

export default function SpotTheWordQuiz({ language, maxQuestions = 5 }: Props) {
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

  // Initialize the quiz when component mounts
  useEffect(() => {
    setupQuiz();
  }, [sentences]);

  const [currentTarget, setCurrentTarget] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuestionTransitioning, setIsQuestionTransitioning] = useState(false);

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
    const nextQuestionNumber = quiz.currentQuestion + 1;
    if (nextQuestionNumber >= maxQuestions) {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizCompleted: true,
        currentQuestion: nextQuestionNumber,
        showFeedback: false,
      }));

      setIsQuestionTransitioning(false);
    } else {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        showFeedback: false,
        currentQuestion: nextQuestionNumber,
      }));

      selectRandomWord(quiz.quizSentences[nextQuestionNumber]);
      setIsQuestionTransitioning(false);
    }
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    setIsLoading(true);

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

      selectRandomWord(newSentences[0]);
      setIsLoading(false);
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

      {quiz.quizCompleted && quiz.answers.length && (
        <ThemedView style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>Quiz Complete!</ThemedText>
          <ThemedText style={styles.resultMode}>
            Mode: {quiz.quizMode === "practice" ? "Practice" : "Test"}
          </ThemedText>
          <ThemedText style={styles.resultScore}>
            Your score: {quiz.score} out of {maxQuestions}
          </ThemedText>
          <Pressable style={styles.resetButton} onPress={() => setupQuiz()}>
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
