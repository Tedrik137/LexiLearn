import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "./ThemedText"; // Or your text component
import LevelProgressBar from "./LevelProgressBat";
import { useLocalSearchParams } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { LanguageCode } from "@/types/languages";
import { ActivityIndicator } from "react-native";

export default function HeaderXPDisplay() {
  const currentLanguageProgress = useAuthStore(
    (state) => state.currentLanguageProgress
  );
  const selectedLanguage = useAuthStore((state) => state.selectedLanguage);
  const authLoading = useAuthStore(
    (state) => state.initializing || state.loading
  );

  if (!selectedLanguage) {
    return <ThemedText>XP...</ThemedText>;
  }

  if (
    authLoading &&
    (!currentLanguageProgress ||
      currentLanguageProgress.languageCode !== selectedLanguage)
  ) {
    return <ActivityIndicator size="small" />;
  }

  if (
    !currentLanguageProgress ||
    currentLanguageProgress.languageCode !== selectedLanguage
  ) {
    return <ThemedText>XP...</ThemedText>;
  }

  return (
    <LevelProgressBar
      xp={currentLanguageProgress.xp}
      level={currentLanguageProgress.level}
    />
  );
}
