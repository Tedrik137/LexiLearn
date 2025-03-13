import { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import PictureButtonGrid from "./PictureButtonGrid";

// QuizContainer.tsx
import { ThemedView } from "./ThemedView";
import { Pressable } from "react-native";
import QuizProgressBar from "./QuizProgressBar";
import { LanguageCode } from "@/types/soundTypes";
import { playSound } from "@/utils/audioUtils";
import { wordPictureTypes } from "@/entities/wordPictureTypes";

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
  });

  const [currentTarget, setCurrentTarget] = useState<[string, any]>(
    wordPictureTypes[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize the quiz when component mounts
  useEffect(() => {
    setupQuiz();
  }, [wordPictureTypes]);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1250 }); // Fade-in over 1.5s
    scale.value = withTiming(1, { duration: 750 }); // Scale-in over 1s
  }, [quiz.currentQuestion]);

  // Select a random letter from the available letters
  const selectRandomTarget = () => {
    // change to select random asset from number of assets, create answer,image pair somewhere in entities dir
    if (wordPictureTypes.length > 0)
      return wordPictureTypes[
        Math.floor(Math.random() * wordPictureTypes.length)
      ];
    return wordPictureTypes[0];
  };

  const createNewQuiz = () => {
    return new Array(maxQuestions).fill(null).map(selectRandomTarget);
  };

  // Handler for when user submits an answer
  const handleAnswerSubmit = (selected: string) => {
    // Check if the answer is correct
    const isCorrect = selected === currentTarget[0];
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
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      currentQuestion: nextQuestionNumber,
      showFeedback: false,
    }));

    if (nextQuestionNumber >= maxQuestions) {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizCompleted: true,
      }));
    } else {
      const nextTarget = quiz.quizWordPictures[nextQuestionNumber];
      setCurrentTarget(nextTarget);

      // Play the sound for the next question
      playSound(nextTarget[0], language);
    }
  };

  const setupQuiz = (newMode?: string, delay = 0) => {
    setIsLoading(true);

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
      }));

      setCurrentTarget(newPictureWords[0]);
      setIsLoading(false);

      // Play the sound after the quiz is set up
      playSound(newPictureWords[0][0], language);
    }, delay);
  };

  const resetQuiz = () => {
    setupQuiz();
  };

  const toggleQuizMode = () => {
    setupQuiz(quiz.quizMode === "practice" ? "test" : "practice", 250);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

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
          <View style={styles.container}>
            <Animated.View style={[styles.imageWrapper, animatedStyle]}>
              <Image
                style={styles.image}
                source={currentTarget[1]}
                contentFit="cover"
              />
            </Animated.View>
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
          </View>
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
    justifyContent: "center",
    width: "100%",
  },
  imageWrapper: {
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    borderRadius: 16, // Optional rounded edges
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 300,
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
