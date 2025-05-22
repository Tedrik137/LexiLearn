import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { requiredXP } from "@/utils/XP";

interface Props {
  xp: number;
  level: number;
}

export default function LevelProgressBar({ xp, level }: Props) {
  const currentStep = xp ?? 100;
  const maxSteps = requiredXP(level ?? 10);
  const progressValue = useSharedValue(currentStep);

  // Update the progress value when currentStep changes
  useEffect(() => {
    progressValue.value = currentStep;
  }, [currentStep]);

  // Animated width calculation
  const progressBarWidth = useDerivedValue(() => {
    return withTiming((progressValue.value / maxSteps) * 75, {
      duration: 300,
    });
  });

  // Animated style for the progress bar
  const progressBarAnimationStyle = useAnimatedStyle(() => ({
    width: progressBarWidth.value,
  }));

  return (
    <View style={[styles.progressContainer]}>
      <View style={styles.outerContainer}>
        <Animated.View
          style={[styles.innerContainer, progressBarAnimationStyle]}
        />
      </View>
      <ThemedText style={[styles.progressText]}>Level: {level}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: "center",
    height: 20,
    marginRight: 10,
  },
  outerContainer: {
    backgroundColor: "#e8ebed",
    height: 10,
    borderRadius: 4,
    width: 75,
    marginBottom: 5,
  },
  innerContainer: {
    backgroundColor: "blue",
    height: 10,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
});
