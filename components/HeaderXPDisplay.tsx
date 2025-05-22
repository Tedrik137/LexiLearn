import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "./ThemedText"; // Or your text component
import LevelProgressBar from "./LevelProgressBat";
import { useLocalSearchParams } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { LanguageCode } from "@/types/languages";
import { ActivityIndicator } from "react-native";

export default function HeaderXPDisplay() {
  const {
    user,
    currentLanguageProgress,
    selectedLanguage,
    loading: authLoading,
  } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      currentLanguageProgress: state.currentLanguageProgress,
      selectedLanguage: state.selectedLanguage,
      loading: state.initializing || state.loading,
    }))
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
