import CustomScrollView from "@/components/CustomScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuthStore } from "@/stores/authStore";
import { LanguageCode } from "@/types/languages";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { stringToBytes } from "uuid/dist/cjs/v35";

export default function LanguageQuizzes() {
  const { proficiency, language } = useLocalSearchParams<{
    proficiency?: string;
    language?: string;
  }>();
  const router = useRouter();
  const setSelectedLanguage = useAuthStore(
    (state) => state.setSelectedLanguage
  );

  const currentLanguageProgress = useAuthStore(
    (state) => state.currentLanguageProgress
  );

  useFocusEffect(
    useCallback(() => {
      if (language) {
        setSelectedLanguage(language as LanguageCode);
      }
    }, [language, setSelectedLanguage])
  );

  if (!language) {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      />
    );
  }

  if (!currentLanguageProgress) {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        canPopNavigation={true}
      >
        <ThemedText>Loading quizzes...</ThemedText>
      </CustomScrollView>
    );
  }

  if (proficiency === "beginner") {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        canPopNavigation={true}
      >
        <ThemedText>
          Completing quizzes will give you XP and unlock more quizzes. Test mode
          gives your more XP than practice mode.
        </ThemedText>
        <ThemedView style={[styles.container]}>
          <ThemedView style={[styles.quizSelectContainer]}>
            <ThemedText>What's that Letter?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/home/${language}/alphabet`);
              }}
              style={{ backgroundColor: "transparent" }}
            >
              <IconSymbol
                name="arrow.right.circle"
                color="navy"
                style={{ backgroundColor: "transparent" }}
              />
            </Pressable>
          </ThemedView>

          <ThemedView
            style={[
              styles.quizSelectContainer,
              currentLanguageProgress.level >= 5
                ? { opacity: 1 }
                : { opacity: 0.5 },
            ]}
          >
            <ThemedText>What's that Word?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/home/${language}/word`);
              }}
              disabled={currentLanguageProgress.level < 5}
            >
              <IconSymbol name="arrow.right.circle" color="navy" />
            </Pressable>
          </ThemedView>
          <ThemedView
            style={[
              styles.quizSelectContainer,
              currentLanguageProgress.level >= 10
                ? { opacity: 1 }
                : { opacity: 0.5 },
            ]}
          >
            <ThemedText>What's that Picture?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/home/${language}/picture`);
              }}
              disabled={currentLanguageProgress.level < 10}
            >
              <IconSymbol name="arrow.right.circle" color="navy" />
            </Pressable>
          </ThemedView>
        </ThemedView>
      </CustomScrollView>
    );
  }
  if (proficiency === "intermediate") {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        canPopNavigation={true}
      >
        <ThemedText>
          Completing quizzes will give you XP and unlock more quizzes.
        </ThemedText>
        <ThemedView style={[styles.container]}>
          <ThemedView style={[styles.quizSelectContainer]}>
            <ThemedText>Unscramble Word?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/home/${language}/scrambled`);
              }}
              style={{ backgroundColor: "transparent" }}
            >
              <IconSymbol
                name="arrow.right.circle"
                color="navy"
                style={{ backgroundColor: "transparent" }}
              />
            </Pressable>
          </ThemedView>
        </ThemedView>
      </CustomScrollView>
    );
  }
  if (proficiency === "advanced") {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        canPopNavigation={true}
      >
        <ThemedText>
          Completing quizzes will give you XP and unlock more quizzes.
        </ThemedText>
        <ThemedView style={[styles.container]}>
          {/* insert advanced quizzes here... */}
        </ThemedView>
      </CustomScrollView>
    );
  }
  if (proficiency === "fluent") {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        canPopNavigation={true}
      >
        <ThemedText>
          Completing quizzes will give you XP and unlock more quizzes.
        </ThemedText>
        <ThemedView style={[styles.container]}>
          {/* insert fluent quizzes here... */}
        </ThemedView>
      </CustomScrollView>
    );
  }
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
