import { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";
import PictureButtonGrid from "./PictureButtonGrid";
import { ThemedView } from "./ThemedView";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import { LanguageCode } from "@/types/languages";
import { wordPictureTypes } from "@/entities/wordPictureTypes";
import PictureQuizImage from "./PictureQuizImage";
import QuizResults from "./PictureQuizResults";
import { useAuthStore } from "@/stores/authStore";

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
  quizWordPictures: [string, any][];
  answers: { question: string; userAnswer: string; correct: boolean }[];
};

export default function PictureQuiz({ language, maxQuestions = 5 }: Props) {
  const [quiz, setQuiz] = useState<Quiz>({
    currentQuestion: 0,
    score: 0,
    quizCompleted: false,
    quizMode: "practice",
    showFeedback: false,
    lastAnswerCorrect: false,
    quizWordPictures: [wordPictureTypes[0]],
    answers: [],
  });
  const [currentTarget, setCurrentTarget] = useState<[string, any]>(
    wordPictureTypes[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const updateUserXP = useAuthStore((state) => state.updateUserXP);

  // Initialize the quiz when component mounts
  useEffect(() => {
    setupQuiz();
  }, [wordPictureTypes]);

  // select random word,image pair as current question
  const selectRandomTarget = () => {
    if (wordPictureTypes.length > 0)
      return wordPictureTypes[
        Math.floor(Math.random() * wordPictureTypes.length)
      ];
    return wordPictureTypes[0]; // change to stock picture and stock result
  };

  // make an array of size maxQuestions of random questions
  const createNewQuiz = () => {
    return new Array(maxQuestions).fill(null).map(selectRandomTarget);
  };

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

      const xpGained = Math.floor((quiz.score / maxQuestions) * 100);

      updateUserXP(xpGained);
    } else {
      const nextTarget = quiz.quizWordPictures[nextQuestionNumber];

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        showFeedback: false,
      }));

      // Wait until the image starts loading before moving forward
      setIsImageLoading(true);
      setCurrentTarget(nextTarget);

      setTimeout(() => {
        setQuiz((prevQuiz) => ({
          ...prevQuiz,
          currentQuestion: nextQuestionNumber,
        }));
        setIsImageLoading(false);
      }, 100); // Delay ensures the transition looks smooth
    }
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    setIsLoading(true);
    setIsImageLoading(true);

    setTimeout(() => {
      const newPictureWords = createNewQuiz();

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizMode: newMode ?? prevQuiz.quizMode,
        currentQuestion: 0,
        score: 0,
        showFeedback: false,
        lastAnswerCorrect: false,
        quizCompleted: false,
        quizWordPictures: newPictureWords,
        answers: [],
      }));

      setCurrentTarget(newPictureWords[0]);
      setIsLoading(false);
      setIsImageLoading(false);
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
              Practice Mode: Learn the picture-word pairs by playing each
              button. Feedback will be shown after each answer.
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
              <PictureQuizImage
                isImageLoading={isImageLoading}
                currentTarget={currentTarget[1]}
                currentQuestion={quiz.currentQuestion}
              />
              <ThemedText>Match the word with the image:</ThemedText>
              <PictureButtonGrid
                language={language}
                quizMode={quiz.quizMode}
                currentQuestion={quiz.currentQuestion}
                currentTarget={currentTarget[0]}
                onAnswerSubmit={handleAnswerSubmit}
                showFeedback={quiz.showFeedback}
                isLastAnswerCorrect={quiz.lastAnswerCorrect}
              />
            </ThemedView>
          )}
        </>
      )}

      {quiz.quizCompleted &&
        quiz.quizWordPictures.length === quiz.answers.length && (
          <QuizResults
            setupQuiz={setupQuiz}
            maxQuestions={maxQuestions}
            quizMode={quiz.quizMode}
            score={quiz.score}
            quizWordPictures={quiz.quizWordPictures}
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
});
