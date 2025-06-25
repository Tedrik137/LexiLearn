import CustomScrollView from "@/components/CustomScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { useAuthStore } from "@/stores/authStore";
import { LanguageCode } from "@/types/languages";
import { HistoryItem } from "@/types/lessonHistory";
import React, { useEffect, useState } from "react";
import { set } from "react-hook-form";
import { ActivityIndicator, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import LessonHistoryService from "@/services/lessonHistoryService";

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [lessonHistory, setLessonHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      LessonHistoryService.fetchLessonHistory(user.uid)
        .then((result) => {
          if (result.success) {
            setLessonHistory(result.history!);
            console.log("History loaded:", result);
          } else {
            console.error("Failed to load history:", result.error);
            setLessonHistory([]);
          }
        })
        .catch((error) => console.error("Failed to load history", error))
        .finally(() => setIsLoading(false));
    }
  }, [user?.uid]);

  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      canPopNavigation={true}
      padding={8}
    >
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading history...</ThemedText>
        </ThemedView>
      ) : lessonHistory.length === 0 ? (
        <ThemedView style={styles.emptyHistoryContainer}>
          <ThemedText style={styles.emptyHistoryText}>
            No lesson history found.
          </ThemedText>
          <ThemedText style={styles.emptyHistorySubText}>
            To start a quiz, go to Home and choose a language.
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={[styles.container]}>
          <ThemedView style={[styles.header]}>
            <ThemedText style={[styles.headerText, styles.timestamp]}>
              Date
            </ThemedText>
            <ThemedText style={[styles.headerText, styles.difficulty]}>
              Difficulty
            </ThemedText>
            <ThemedText style={[styles.headerText, styles.language]}>
              Language
            </ThemedText>
            <ThemedText style={[styles.headerText, styles.name]}>
              Name
            </ThemedText>
            <ThemedText style={[styles.headerText, styles.score]}>
              Score
            </ThemedText>
            <ThemedText style={[styles.headerText, styles.mode]}>
              Mode
            </ThemedText>
          </ThemedView>
          {lessonHistory.map((item) => (
            <ThemedView key={item.id || uuidv4()} style={[styles.row]}>
              <ThemedText style={[styles.rowText, styles.timestamp]}>
                {item.date}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.difficulty]}>
                {item.difficulty}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.language]}>
                {item.language}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.name]}>
                {item.name}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.score]}>
                {item.score}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.mode]}>
                {item.mode}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#A1CEDC",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 2,
    borderColor: "#ddd", // Consider using a theme-aware color
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    paddingHorizontal: 4,
  },
  rowText: {
    fontSize: 12,
    textAlign: "left",
    paddingHorizontal: 4,
  },
  // Column specific flex styles
  timestamp: { flex: 1.5 },
  difficulty: { flex: 1.5 },
  language: { flex: 1.4 },
  name: { flex: 1, flexWrap: "wrap" },
  score: { flex: 1 },
  mode: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    textAlign: "center", // Ensure text within centers if multiple lines
  },
  emptyHistoryText: {
    fontSize: 18, // Made it slightly larger
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8, // Added margin for subtext
  },
  emptyHistorySubText: {
    // Style for the new subtext
    fontSize: 14,
    textAlign: "center",
  },
});
