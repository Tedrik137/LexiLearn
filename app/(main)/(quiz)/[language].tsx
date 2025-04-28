import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

export default function LanguageQuizzes() {
  const { proficiency, language } = useLocalSearchParams();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        {proficiency} {language} Quiz
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
