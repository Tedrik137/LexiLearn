import { useAuthStore } from "@/stores/authStore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import LessonHistoryService from "@/services/lessonHistoryService";

const speechScorer = require("word-error-rate");

interface Props {
  quizMode: string;
  answers: { response: string; uri: string }[];
  setupQuiz: () => void;
}

const normalizeText = (response: string, transcription: string) => {
  // 1. Normalize strings: lowercase and remove punctuation
  const cleanResponse = response.toLowerCase().replace(/[^\w\s]/g, "");
  const cleanTranscription = transcription
    .toLowerCase()
    .replace(/[^\w\s]/g, "");

  return { cleanResponse, cleanTranscription };
};

const RolePlayingScenarioQuizResults = ({
  answers,
  quizMode,
  setupQuiz,
}: Props) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<
    { response: string; transcription: string }[]
  >([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const user = useAuthStore((state) => state.user);
  const language = useAuthStore((state) => state.selectedLanguage);

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // This is an async IIFE (Immediately Invoked Function Expression).
    // It allows us to use async/await inside a useEffect hook.
    const runAnalysisAndSave = async () => {
      // 1. Analyze the results and wait for them to complete.
      setIsAnalyzing(true);
      setSaving(true);

      const analysisResults = await analyzeResults();

      const totalAccuracy = analysisResults.reduce(
        (acc, result) => acc + (result.accuracy || 0),
        0
      );
      const averageAccuracy = totalAccuracy / analysisResults.length;
      console.log("Average Accuracy:", averageAccuracy);
      setOverallScore(averageAccuracy);
      setResults(analysisResults);

      // 2. After analysis is done, perform the save with the results.
      await performSave(averageAccuracy);

      setIsAnalyzing(false);
      setSaving(false);
    };

    runAnalysisAndSave();
  }, []); // Empty dependency array ensures this runs only once on mount.

  const performSave = async (calculatedScore: number) => {
    if (!user || !language) {
      console.warn(
        "QuizResults: User or language not available, cannot save results."
      );
      return;
    }

    try {
      const result = await LessonHistoryService.addLessonEntry({
        userId: user.uid,
        language: language,
        name: "Role Playing Scenarios",
        score: calculatedScore,
        mode: quizMode === "practice" ? "Practice" : "Test",
        difficulty: "Intermediate",
      });

      if (result.success) {
        console.log("Quiz results saved successfully:", result);
      } else {
        console.error("Failed to save quiz results:", result.error);
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    } finally {
      setSaving(false);
    }
  };

  const analyzeResults = async () => {
    const analysisData = [];
    const functions = getFunctions();

    const recognitionConfig = Platform.select({
      ios: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: language,
      },
      android: {
        encoding: "AMR_WB",
        sampleRateHertz: 16000,
        languageCode: language,
      },
    });

    for (const answer of answers) {
      if (!answer.uri) {
        console.warn("No audio URI provided for answer:", answer);
        continue;
      }
      try {
        const analyzeSpeech = httpsCallable(functions, "analyzeSpeech");
        const result = await analyzeSpeech({
          audioUri: answer.uri,
          recognitionConfig: recognitionConfig,
        });

        const { transcription } = result.data as {
          success: boolean;
          transcription: string;
        };

        const { cleanResponse, cleanTranscription } = normalizeText(
          answer.response,
          transcription || ""
        );

        const wordErrorRate = speechScorer.wordErrorRate(
          cleanResponse,
          cleanTranscription
        );

        const accuracy = Math.max(0, 1 - wordErrorRate) * 100; // Convert to percentage

        analysisData.push({
          response: answer.response,
          transcription: transcription || "No transcription available",
          accuracy: accuracy,
        });
      } catch (error) {
        console.error("Error analyzing speech for URI:", answer.uri, error);
        analysisData.push({
          response: answer.response,
          transcription: "Error during analysis.",
        });
      }
    }

    setIsAnalyzing(false);
    return analysisData;
  };

  return (
    <ThemedView style={styles.resultContainer}>
      <ThemedText style={styles.resultTitle}>Quiz Complete!</ThemedText>
      {saving ? (
        <ThemedText style={[styles.saveText]}>
          Saving your results...
        </ThemedText>
      ) : (
        <ThemedText style={[styles.saveText]}>
          Quiz results saved. See them in your profile lesson history.
        </ThemedText>
      )}
      <ThemedText style={styles.resultMode}>
        Mode: {quizMode === "practice" ? "Practice" : "Test"}
      </ThemedText>
      {isAnalyzing ? (
        <>
          <ThemedText>Analyzing your responses...</ThemedText>
          <ActivityIndicator size="large" color="#0000ff" />
        </>
      ) : (
        <>
          <ThemedText style={styles.reviewText}>
            {" "}
            Review Your Answers:
          </ThemedText>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {results.map((result, index) => (
              <ThemedView key={index} style={styles.resultRow}>
                {/* Column 1: Expected Response */}
                <ThemedView style={styles.resultColumn}>
                  <ThemedText style={styles.labelText}>Response:</ThemedText>
                  <ThemedText>{result.response}</ThemedText>
                </ThemedView>

                {/* Column 2: User's Transcription */}
                <ThemedView style={styles.resultColumn}>
                  <ThemedText style={styles.labelText}>
                    Transcription:
                  </ThemedText>
                  <ThemedText>{result.transcription}</ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ScrollView>
        </>
      )}

      <ThemedText style={styles.resultScore}>
        Your average accuracy: {overallScore.toFixed(0)}%
      </ThemedText>
      <Pressable style={styles.resetButton} onPress={() => setupQuiz()}>
        <ThemedText style={styles.resetButtonText}>Try Again</ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20, // Fixes the button being cut off
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultMode: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  saveText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
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
  answerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
  },
  scrollView: {
    maxHeight: 500, // Adjust height as needed
    width: "100%",
  },
  scrollContent: {
    alignItems: "flex-start",
    paddingBottom: 20,
    rowGap: 10,
  },
  resultRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start", // This aligns the columns at the top.
  },
  resultColumn: {
    flex: 1, // This makes each column take up 50% of the width.
    paddingHorizontal: 5, // Adds some space inside the columns.
  },
  labelText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});

export default RolePlayingScenarioQuizResults;
