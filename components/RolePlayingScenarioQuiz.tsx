import React, { useEffect, useRef, useState } from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import {
  descriptions,
  sentences,
  ScenarioSentence,
} from "../entities/rolePlayingSentences";
import { useAuthStore } from "@/stores/authStore";
import { playSound } from "@/utils/audioUtils";
import { LanguageCode } from "@/types/languages";
import RolePlayingScenario from "./RolePlayingScenario";
import { StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import SoundContainer from "./SoundContainer";
import { Audio } from "expo-av";

interface Props {
  maxQuestions?: number;
  isScreenFocused: boolean;
}

type Quiz = {
  currentQuestion: number;
  score: number;
  quizCompleted: boolean;
  quizMode: string;
  scenarios: string[];
  answers: Audio.Sound[];
};

const width = Dimensions.get("window").width;

const getUniqueScenarios = (scenarios: string[], count: number) => {
  // Create a copy to avoid modifying the original array from the import
  const shuffled = [...scenarios];

  // Fisher-Yates shuffle algorithm for an unbiased shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }

  // Return the first 'count' items from the shuffled array
  return shuffled.slice(0, count);
};

const getScenarios = (count: number) => {
  // Create a copy to avoid modifying the original array from the import
  const scenarios = Object.keys(descriptions);
  const uniqueScenarios = getUniqueScenarios(scenarios, count);

  return uniqueScenarios;
};

const RolePlayingScenarioQuiz = ({
  maxQuestions = 3,
  isScreenFocused,
}: Props) => {
  const [quiz, setQuiz] = useState<Quiz>({
    currentQuestion: 0,
    score: 0,
    quizCompleted: false,
    quizMode: "practice",
    scenarios: ["cafe", "library", "park"],
    answers: [],
  });

  const [currentScenario, setCurrentScenario] = useState<ScenarioSentence[]>([
    {
      name: "Greeting",
      character: "Barista",
      prompt: "Welcome to the cafe! How can I help you today?",
      response: "Hello! I'd like to order a coffee.",
    },
    {
      name: "Order Coffee",
      character: "Barista",
      prompt: "What kind of coffee would you like?",
      response: "I'd like a cappuccino, please.",
    },
    {
      name: "Thank You",
      character: "Barista",
      prompt: "Thank you for your order! Enjoy your coffee!",
      response: "Thank you! I appreciate it.",
    },
  ]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const carouselRef = useRef<ICarouselInstance>(null);

  const language = useAuthStore((state) => state.selectedLanguage) || "en-AU"; // Default to English if no language is selected

  useEffect(() => {
    setTimeout(() => {
      carouselRef.current?.scrollTo({ index: 0, animated: false });
    }, 0);
  }, [quiz.currentQuestion]);

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
  }, [descriptions, sentences, isScreenFocused]);

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
      const newScenarios = getScenarios(maxQuestions);

      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizMode: newMode ?? prevQuiz.quizMode,
        currentQuestion: 0,
        score: 0,
        quizCompleted: false,
        scenarios: newScenarios,
        answers: [],
      }));

      setCurrentScenario(sentences[newScenarios[0]]);
      setIsLoading(false);
      console.log(
        `QuizContainer: Quiz setup complete. First prompt: ${
          sentences[newScenarios[0]][0].response
        }`
      );

      if (isScreenFocused) {
        // Play sound only if screen is focused
        const playSequentially = async () => {
          try {
            const firstSentence = sentences[newScenarios[0]][0];

            await playSound(
              `The ${firstSentence.character} says: ${firstSentence.prompt}`,
              language as LanguageCode,
              "FEMALE"
            );

            await playSound(
              `You say: ${firstSentence.response}`,
              language as LanguageCode,
              "MALE"
            );
          } catch (error) {
            console.error("Error playing sound:", error);
          }
        };

        playSequentially();
      }
    }, delay);
  };

  const moveToNextQuestion = () => {
    if (quiz.currentQuestion < quiz.scenarios.length - 1) {
      const nextQuestionIndex = quiz.currentQuestion + 1;
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        currentQuestion: nextQuestionIndex,
      }));
      setCurrentScenario(sentences[quiz.scenarios[nextQuestionIndex]] || []);
      setCurrentScenarioIndex(0);

      if (isScreenFocused) {
        // Play sound only if screen is focused
        const playSequentially = async () => {
          try {
            const firstSentence =
              sentences[quiz.scenarios[nextQuestionIndex]][0];

            await playSound(
              `The ${firstSentence.character} says: ${firstSentence.prompt}`,
              language as LanguageCode,
              "FEMALE"
            );

            await playSound(
              `You say: ${firstSentence.response}`,
              language as LanguageCode,
              "MALE"
            );
          } catch (error) {
            console.error("Error playing sound:", error);
          }
        };

        playSequentially();
      }
    } else {
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        quizCompleted: true,
      }));
    }
  };

  const moveToNextSentence = () => {
    if (currentScenarioIndex < currentScenario.length - 1) {
      const nextIndex = currentScenarioIndex + 1;
      setCurrentScenarioIndex(nextIndex);

      if (isScreenFocused) {
        // Play sound only if screen is focused
        const playSequentially = async () => {
          try {
            const nextSentence = currentScenario[nextIndex];

            await playSound(
              `The ${nextSentence.character} says: ${nextSentence.prompt}`,
              language as LanguageCode,
              "FEMALE"
            );

            await playSound(
              `You say: ${nextSentence.response}`,
              language as LanguageCode,
              "MALE"
            );
          } catch (error) {
            console.error("Error playing sound:", error);
          }
        };

        carouselRef.current?.next();

        playSequentially();
      }
    } else {
      // Scenario completed, show feedback, move to next question after a delay
      moveToNextQuestion();
    }
  };

  const saveCurrentSound = (currentSound: Audio.Sound) => {
    if (quiz.quizCompleted) {
      console.warn("Quiz already completed. Cannot save sound.");
      return;
    }

    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      answers: [...prevQuiz.answers, currentSound],
    }));

    console.log(
      `Saved sound for question ${quiz.currentQuestion + 1}. Total answers: ${
        quiz.answers.length
      }`
    );

    // Move to next sentence after saving sound
    moveToNextSentence();
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

  if (!currentScenario || currentScenario.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>
          No scenarios available for this quiz. Please try again later.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
      >
        Role-Playing Scenario Quiz
      </ThemedText>
      <ThemedText
        style={{ fontSize: 16, fontWeight: "light", marginBottom: 10 }}
      >
        {quiz.scenarios[quiz.currentQuestion].charAt(0).toUpperCase() +
          quiz.scenarios[quiz.currentQuestion].slice(1)}
      </ThemedText>

      <Carousel
        width={width}
        height={500}
        ref={carouselRef}
        data={currentScenario}
        fixedDirection="positive"
        renderItem={({ item }) => (
          <RolePlayingScenario
            scenario={item}
            scenarioName={quiz.scenarios[quiz.currentQuestion]}
          />
        )}
      />
      <SoundContainer
        currentScenarioIndex={currentScenarioIndex}
        saveCurrentSound={saveCurrentSound}
      />
    </ThemedView>
  );
};

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

export default RolePlayingScenarioQuiz;
