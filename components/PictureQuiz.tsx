import { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";
import PictureButtonGrid from "./PictureButtonGrid";
import { ThemedView } from "./ThemedView";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import { wordPictureMap } from "@/entities/wordPictureTypes";
import PictureQuizImage from "./PictureQuizImage";
import PictureQuizResults from "./PictureQuizResults";
import { useAuthStore } from "@/stores/authStore";

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
  quizWordPictures: [string, any][];
  answers: { question: string; userAnswer: string; correct: boolean }[];
};

export default function PictureQuiz({
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
    quizWordPictures: [], // Start with an empty array
    answers: [],
  });
  // Start with null, as it will be set by setupQuiz
  const [currentTarget, setCurrentTarget] = useState<[string, any] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start in loading state
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const updateUserXP = useAuthStore((state) => state.updateUserXP);
  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU";

  // Initialize or reset the quiz when the screen is focused or language changes
  useEffect(() => {
    if (isScreenFocused) {
      console.log(
        `PictureQuiz: Screen focused or language changed. Setting up quiz for ${language}.`
      );
      setupQuiz();
    } else {
      console.log(
        `PictureQuiz: Screen not focused. Skipping setup for ${language}.`
      );
    }
  }, [language, isScreenFocused]); // Depend on language to reset quiz on change

  // Effect for handling XP gain on quiz completion
  useEffect(() => {
    if (!isScreenFocused || !quiz.quizCompleted) {
      return;
    }

    const xpGained =
      quiz.quizMode === "practice"
        ? Math.floor((quiz.score / maxQuestions) * 200)
        : Math.floor((quiz.score / maxQuestions) * 350);

    if (xpGained > 0) {
      console.log(
        `Quiz completed. Gained ${xpGained} XP for language ${language}.`
      );
      updateUserXP(xpGained).catch((error) => {
        console.error("Error updating user XP:", error);
      });
    }
  }, [quiz.quizCompleted, isScreenFocused]);

  // **FIX: Generate a unique, random set of questions**
  const createNewQuiz = () => {
    const allQuestionsObject =
      wordPictureMap[language as keyof typeof wordPictureMap];

    if (!allQuestionsObject) {
      console.warn(`No picture questions found for language: ${language}`);
      return [];
    }

    // 1. Convert the object into an array of [word, pictureUrl] pairs
    const allQuestionsArray = Object.entries(allQuestionsObject);

    // 2. Shuffle the array using the Fisher-Yates algorithm
    const shuffledQuestions = [...allQuestionsArray];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
    }

    // 3. Take the first `maxQuestions` from the shuffled list
    const numQuestionsToTake = Math.min(maxQuestions, shuffledQuestions.length);
    return shuffledQuestions.slice(0, numQuestionsToTake);
  };

  const handleAnswerSubmit = (selected: string) => {
    if (!currentTarget) return; // Guard against submission before setup

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
      setTimeout(() => moveToNextQuestion(), 1000);
    } else {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    const nextQuestionNumber = quiz.currentQuestion + 1;
    if (nextQuestionNumber >= quiz.quizWordPictures.length) {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizCompleted: true,
        showFeedback: false,
      }));
    } else {
      const nextTarget = quiz.quizWordPictures[nextQuestionNumber];
      setIsImageLoading(true);
      setCurrentTarget(nextTarget);
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        currentQuestion: nextQuestionNumber,
        showFeedback: false,
      }));
    }
  };

  const setupQuiz = (newMode?: string) => {
    setIsLoading(true);
    const newPictureWords = createNewQuiz();

    if (newPictureWords.length === 0) {
      console.error("Failed to create quiz: No questions available.");
      setIsLoading(false);
      // Optionally, show an error message to the user
      return;
    }

    setQuiz({
      quizMode: newMode ?? quiz.quizMode,
      currentQuestion: 0,
      score: 0,
      showFeedback: false,
      lastAnswerCorrect: false,
      quizCompleted: false,
      quizWordPictures: newPictureWords,
      answers: [],
    });

    setCurrentTarget(newPictureWords[0]);
    setIsImageLoading(true); // Image for the first question is loading
    setIsLoading(false);
  };

  const toggleQuizMode = () => {
    setupQuiz(quiz.quizMode === "practice" ? "test" : "practice");
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading Quiz...</ThemedText>
      </ThemedView>
    );
  }

  if (quiz.quizCompleted) {
    return (
      <PictureQuizResults
        setupQuiz={setupQuiz}
        maxQuestions={maxQuestions}
        quizMode={quiz.quizMode}
        score={quiz.score}
        answers={quiz.answers}
        quizWordPictures={quiz.quizWordPictures}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <QuizProgressBar
        maxSteps={quiz.quizWordPictures.length}
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
          <ThemedText
            style={[
              styles.modeButtonText,
              quiz.quizMode === "practice" && styles.activeModeText,
            ]}
          >
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
          <ThemedText
            style={[
              styles.modeButtonText,
              quiz.quizMode === "test" && styles.activeModeText,
            ]}
          >
            Test Mode
          </ThemedText>
        </Pressable>
      </ThemedView>

      {currentTarget && (
        <>
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
          <PictureQuizImage
            isImageLoading={isImageLoading}
            onImageLoaded={() => setIsImageLoading(false)}
            currentTarget={currentTarget[1]}
            currentQuestion={quiz.currentQuestion}
          />
          <ThemedText style={styles.instructionText}>
            Match the word with the image:
          </ThemedText>
          <PictureButtonGrid
            language={language}
            quizMode={quiz.quizMode}
            currentQuestion={quiz.currentQuestion}
            currentTarget={currentTarget[0]}
            onAnswerSubmit={handleAnswerSubmit}
            showFeedback={quiz.showFeedback}
            isLastAnswerCorrect={quiz.lastAnswerCorrect}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  modeToggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 15,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  activeMode: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    fontWeight: "600",
    color: "#007AFF",
  },
  activeModeText: {
    color: "#FFFFFF",
  },
  instructionText: {
    fontSize: 16,
    marginVertical: 10,
  },
  modeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
