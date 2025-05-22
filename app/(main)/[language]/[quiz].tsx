import CustomScrollView from "@/components/CustomScrollView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import QuizCointainer from "@/components/QuizContainer";
import { letters } from "@/entities/letters";
import { LanguageCode } from "@/types/languages";
import { ThemedText } from "@/components/ThemedText"; // Import ThemedText for error message
import PictureQuiz from "@/components/PictureQuiz";
import SpotTheWordQuiz from "@/components/SpotTheWordQuiz";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function LanguageQuiz() {
  let { proficiency, language, quiz } = useLocalSearchParams();
  const router = useRouter();
  const setSelectedLanguage = useAuthStore(
    (state) => state.setSelectedLanguage
  );

  useEffect(() => {
    // Set the selected language in the auth store
    if (language) {
      setSelectedLanguage(language as LanguageCode);
    }
  }, [language, setSelectedLanguage]);

  if (!language) {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      />
    );
  }

  // Assert language type after validation
  const validLanguage = language as LanguageCode;

  if (quiz === "alphabet") {
    // Get the correct letter array for the language
    const currentLetters = letters[validLanguage];

    // Check if letters exist for the language
    if (!currentLetters) {
      return (
        <CustomScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        >
          <ThemedText>
            Error: No letters found for language {validLanguage}.
          </ThemedText>
        </CustomScrollView>
      );
    }

    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <QuizCointainer
          letters={currentLetters} // Pass the correct letter array
          language={validLanguage} // Pass the validated language code
        ></QuizCointainer>
      </CustomScrollView>
    );
  }

  if (quiz === "picture") {
    // Handle picture quiz logic here
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <PictureQuiz language={validLanguage} />
      </CustomScrollView>
    );
  }
  if (quiz === "word") {
    // Handle word quiz logic here
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <SpotTheWordQuiz language={validLanguage} />
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
