import { Image, StyleSheet, Platform } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";
import LetterSoundGrid from "@/components/LetterSoundGrid";
import PictureQuiz from "@/components/PictureQuiz";

export default function HomeScreen() {
  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.titleContainer}>
        <LetterSoundGrid
          letters={["n", "m", "l", "k", "j", "i"]}
          language="en-au"
        ></LetterSoundGrid>
      </ThemedView>
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
