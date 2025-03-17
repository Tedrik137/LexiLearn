import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";

interface Props {
  maxSteps: number;
  currentStep: number;
  marginTop: number;
}

export default function QuizProgressBar({
  maxSteps,
  currentStep,
  marginTop,
}: Props) {
  const progressValue = useSharedValue(0);

  // Update the progress value when currentStep changes
  useEffect(() => {
    progressValue.value = currentStep;
  }, [currentStep, maxSteps]);

  // Animated width calculation
  const progressBarWidth = useDerivedValue(() => {
    return withTiming((progressValue.value / maxSteps) * 200, {
      duration: 300,
    });
  });

  // Animated style for the progress bar
  const progressBarAnimationStyle = useAnimatedStyle(() => ({
    width: progressBarWidth.value,
  }));

  return (
    <View style={[styles.progressContainer, { marginTop: marginTop }]}>
      <View style={styles.outerContainer}>
        <Animated.View
          style={[styles.innerContainer, progressBarAnimationStyle]}
        />
      </View>
      <ThemedText style={styles.progressText}>
        Question {Math.min(currentStep + 1, maxSteps)} of {maxSteps}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: "center",
  },
  outerContainer: {
    backgroundColor: "#e8ebed",
    height: 10,
    borderRadius: 4,
    width: 200,
    marginBottom: 5,
  },
  innerContainer: {
    backgroundColor: "blue",
    height: 10,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
  },
});
