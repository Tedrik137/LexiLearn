import CustomScrollView from "@/components/CustomScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function LanguageQuizzes() {
  const { proficiency, language } = useLocalSearchParams();
  const router = useRouter();

  if (proficiency === "beginner") {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <ThemedText>
          Completing quizzes will give you XP and unlock more quizzes.
        </ThemedText>
        <ThemedView style={[styles.container]}>
          <ThemedView style={[styles.quizSelectContainer]}>
            <ThemedText>What's that Letter?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/(main)/${language}/alphabet`);
              }}
            >
              <IconSymbol name="arrow.right.circle" color="navy" />
            </Pressable>
          </ThemedView>
          <ThemedView style={[styles.quizSelectContainer]}>
            <ThemedText>What's that Picture?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/(main)/${language}/picture`);
              }}
            >
              <IconSymbol name="arrow.right.circle" color="navy" />
            </Pressable>
          </ThemedView>
          <ThemedView style={[styles.quizSelectContainer]}>
            <ThemedText>What's that Word?</ThemedText>
            <Pressable
              onPress={() => {
                // push the english alphabet quiz onto the navigation stack
                router.push(`/(main)/${language}/word`);
              }}
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
      >
        <ThemedText>
          Completing quizzes will give you XP and unlock more quizzes.
        </ThemedText>
        <ThemedView style={[styles.container]}>
          {/* insert intermediate quizzes here... */}
        </ThemedView>
      </CustomScrollView>
    );
  }
  if (proficiency === "advanced") {
    return (
      <CustomScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
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
