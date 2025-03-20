import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";
import PictureButtonGrid from "./PictureButtonGrid";
import { ThemedView } from "./ThemedView";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import { LanguageCode } from "@/types/soundTypes";
import { wordPictureTypes } from "@/entities/wordPictureTypes";
import PictureQuizImage from "./PictureQuizImage";
import QuizResults from "./PictureQuizResults";
import SelectableSentence from "./SelectableSentence";

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
    answers: [],
  });
  const [currentTarget, setCurrentTarget] = useState<string>("tree");
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selected: string) => {
    // Check if the answer is correct
    const isCorrect = selected === currentTarget[0];

    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      score: isCorrect ? prevQuiz.score + 1 : prevQuiz.score,
      lastAnswerCorrect: isCorrect,
      showFeedback: prevQuiz.quizMode === "practice",
      answers: [
        ...prevQuiz.answers,
        {
          question: currentTarget[0],
          userAnswer: selected,
          correct: isCorrect,
        },
      ],
    }));

    if (quiz.quizMode === "practice") {
      // Move to next question after a delay
      setTimeout(() => {
        moveToNextQuestion();
      }, 1000); // 1-second delay to show feedback
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
    } else {
      const nextTarget = "next";

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        showFeedback: false,
      }));

      setCurrentTarget(nextTarget);

      setTimeout(() => {
        setQuiz((prevQuiz) => ({
          ...prevQuiz,
          currentQuestion: nextQuestionNumber,
        }));
      }, 100); // Delay ensures the transition looks smooth
    }
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    setIsLoading(true);

    setTimeout(() => {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizMode: newMode ?? prevQuiz.quizMode,
        currentQuestion: 0,
        score: 0,
        showFeedback: false,
        lastAnswerCorrect: false,
        quizCompleted: false,
        answers: [],
      }));

      setCurrentTarget("first");
      setIsLoading(false);
    }, delay);
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
          <View style={styles.container}>
            {currentTarget && (
              <>
                <ThemedText style={{ textAlign: "center" }}>
                  Match the audio cue with the word in the sentence:
                </ThemedText>
                <SelectableSentence
                  setSelectedWord={setSelectedWord}
                  sentence="This is my beautiful long long long sentence!"
                ></SelectableSentence>
              </>
            )}
          </View>
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
});
