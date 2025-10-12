import React, { useEffect, useRef, useState } from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import {
  descriptions,
  rolePlayingSentences,
  ScenarioSentence,
} from "../entities/rolePlayingSentences";
import { useAuthStore } from "@/stores/authStore";
import { playSound } from "@/utils/audioUtils";
import { LanguageCode } from "@/types/languages";
import RolePlayingScenario from "./RolePlayingScenario";
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import SoundContainer from "./SoundContainer";
import QuizProgressBar from "./QuizProgressBar";
import RolePlayingScenarioQuizResults from "./RolePlayingScenarioQuizResults";

interface Props {
  maxQuestions?: number;
  isScreenFocused: boolean;
}

export type RolePlayingQuiz = {
  currentQuestion: number;
  score: number;
  quizCompleted: boolean;
  quizMode: string;
  scenarios: string[];
  answers: { response: string; uri: string }[];
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
  maxQuestions = 1,
  isScreenFocused,
}: Props) => {
  const [quiz, setQuiz] = useState<RolePlayingQuiz>({
    currentQuestion: 0,
    score: 0,
    quizCompleted: false,
    quizMode: "practice",
    scenarios: ["cafe", "library", "park"],
    answers: [],
  });
  const [isPlaying, setIsPlaying] = useState(false);

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
  const updateUserXP = useAuthStore((state) => state.updateUserXP);

  useEffect(() => {
    setTimeout(() => {
      carouselRef.current?.scrollTo({ index: 0, animated: false });
    }, 0);
  }, [quiz.currentQuestion]);

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
  }, [descriptions, rolePlayingSentences, language, isScreenFocused]);

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
      }));

      setCurrentScenario(rolePlayingSentences[language][newScenarios[0]]);
      setIsLoading(false);
      console.log(
        `QuizContainer: Quiz setup complete. First prompt: ${
          rolePlayingSentences[language][newScenarios[0]][0].response
        }`
      );

      if (isScreenFocused) {
        // Play sound only if screen is focused
        const playSequentially = async () => {
          try {
            setIsPlaying(true);

            const firstSentence =
              rolePlayingSentences[language][newScenarios[0]][0];

            await playSound(
              `The ${firstSentence.character} ${
                language === "ja-JP" ? `say` : `says`
              }: ${firstSentence.prompt}`,
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
          } finally {
            setIsPlaying(false);
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
      setCurrentScenario(
        rolePlayingSentences[language][quiz.scenarios[nextQuestionIndex]] || []
      );
      setCurrentScenarioIndex(0);

      if (isScreenFocused) {
        // Play sound only if screen is focused
        const playSequentially = async () => {
          try {
            setIsPlaying(true);
            const firstSentence =
              rolePlayingSentences[language][
                quiz.scenarios[nextQuestionIndex]
              ][0];

            await playSound(
              `The ${firstSentence.character} ${
                language === "ja-JP" ? `say` : `says`
              }: ${firstSentence.prompt}`,
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
          } finally {
            setIsPlaying(false);
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
            setIsPlaying(true);
            const nextSentence = currentScenario[nextIndex];

            await playSound(
              `The ${nextSentence.character} ${
                language === "ja-JP" ? `say` : `says`
              }: ${nextSentence.prompt}`,
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
          } finally {
            setIsPlaying(false);
          }
        };

        carouselRef.current?.next();

        playSequentially();
      }
    } else {
      // Scenario completed, move to next question
      moveToNextQuestion();
    }
  };

  const replayPrompt = async () => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const currentSentence = currentScenario[currentScenarioIndex];

      await playSound(
        `The ${currentSentence.character} ${
          language === "ja-JP" ? `say` : `says`
        }: ${currentSentence.prompt}`,
        language as LanguageCode,
        "FEMALE"
      );

      await playSound(
        `You say: ${currentSentence.response}`,
        language as LanguageCode,
        "MALE"
      );
    } catch (error) {
      console.error("Error playing sound:", error);
    } finally {
      setIsPlaying(false);
    }
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
      <QuizProgressBar
        maxSteps={maxQuestions}
        currentStep={quiz.currentQuestion}
        marginTop={10}
      />

      {!quiz.quizCompleted && (
        <>
          <ThemedText
            style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
          >
            Role-Playing Scenario Quiz
          </ThemedText>
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
              Practice Mode: Practice your speaking skills! Repeat the response
              after the audio is played. Speak into the microphone to record
              your response. Listen to your response after recording to be sure
              you want to go to the next sentence.
            </ThemedText>
          )}

          {quiz.quizMode === "test" && (
            <ThemedText style={styles.modeDescription}>
              Test Mode: Put your practice to the test! Repeat the response
              after the audio is played. Speak into the microphone to record
              your response. You can only record once per sentence and will not
              be able to listen to your response.
            </ThemedText>
          )}

          <ThemedText
            style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
          >
            {quiz.scenarios[quiz.currentQuestion].charAt(0).toUpperCase() +
              quiz.scenarios[quiz.currentQuestion].slice(1)}
          </ThemedText>

          {currentScenario && (
            <ThemedView style={styles.container}>
              <ThemedView pointerEvents={isPlaying ? "none" : "auto"}>
                <Carousel
                  width={width}
                  height={500}
                  ref={carouselRef}
                  data={currentScenario}
                  enabled={false}
                  fixedDirection="positive"
                  renderItem={({ item }) => (
                    <RolePlayingScenario
                      scenario={item}
                      scenarioName={quiz.scenarios[quiz.currentQuestion]}
                    />
                  )}
                />
              </ThemedView>
              <SoundContainer
                moveToNextSentence={moveToNextSentence}
                setQuiz={setQuiz}
                currentScenario={currentScenario}
                currentScenarioIndex={currentScenarioIndex}
                isPromptPlaying={isPlaying}
                quizMode={quiz.quizMode}
                replayPrompt={replayPrompt}
              />
            </ThemedView>
          )}
        </>
      )}

      {quiz.quizCompleted && (
        <RolePlayingScenarioQuizResults
          answers={quiz.answers}
          quizMode={quiz.quizMode}
          setupQuiz={setupQuiz}
        />
      )}
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
