import CustomScrollView from "@/components/CustomScrollView";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import QuizCointainer from "@/components/QuizContainer";
import { letters } from "@/entities/letters";
import { LanguageCode } from "@/types/languages";
import { ThemedText } from "@/components/ThemedText"; // Import ThemedText for error message
import PictureQuiz from "@/components/PictureQuiz";
import SpotTheWordQuiz from "@/components/SpotTheWordQuiz";
import { useAuthStore } from "@/stores/authStore";
import { useCallback, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

export default function LanguageQuiz() {
  let { proficiency, language, quiz } = useLocalSearchParams();
  const router = useRouter();
  const setSelectedLanguage = useAuthStore(
    (state) => state.setSelectedLanguage
  );
  const selectedLanguage = useAuthStore((state) => state.selectedLanguage);
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      // Set the selected language when the component is focused
      if (language) {
        setSelectedLanguage(language as LanguageCode);
      }
    }, [language, setSelectedLanguage, quiz])
  );

  if (!language || !selectedLanguage || selectedLanguage !== language) {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <ThemedText>Loading quiz...</ThemedText>
      </CustomScrollView>
    );
  }

  if (quiz === "alphabet") {
    // Get the correct letter array for the language
    const currentLetters = letters[selectedLanguage];

    // Check if letters exist for the language
    if (!currentLetters) {
      return (
        <CustomScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        >
          <ThemedText>
            Error: No letters found for language {selectedLanguage}.
          </ThemedText>
        </CustomScrollView>
      );
    }

    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <QuizCointainer isScreenFocused={isFocused} />
      </CustomScrollView>
    );
  }

  if (quiz === "picture") {
    // Handle picture quiz logic here
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <PictureQuiz isScreenFocused={isFocused} />
      </CustomScrollView>
    );
  }
  if (quiz === "word") {
    // Handle word quiz logic here
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <SpotTheWordQuiz isScreenFocused={isFocused} />
      </CustomScrollView>
    );
  }

  // Handle other quiz types or return null/default view
  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedText>Quiz type '{quiz}' not found.</ThemedText>
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  quizSelectContainer: {
    backgroundColor: "#A1CEDC",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
