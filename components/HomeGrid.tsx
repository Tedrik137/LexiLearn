import React, { useState } from "react";
import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import AnimatedNavigationButton from "./AnimatedNavigationButton";

const languages = [
  { id: 1, name: "English" },
  { id: 2, name: "Spanish" },
  { id: 3, name: "French" },
  { id: 4, name: "Japanese" },
];

export default function HomeGrid() {
  return (
    <ThemedView style={styles.columnContainer}>
      <ThemedText>Choose a language:</ThemedText>
      <ThemedView style={styles.container}>
        {languages.map((language) => (
          <AnimatedNavigationButton
            key={language.id}
            buttonText={language.name}
          ></AnimatedNavigationButton>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
  },
  columnContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
});
