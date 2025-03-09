// QuizProgressBar.tsx
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import { ThemedText } from "./ThemedText";

interface Props {
  maxSteps: number;
  currentStep: number;
}

const QuizProgressBar = ({ maxSteps, currentStep }: Props) => {
  const progressValue = useSharedValue(0);
  const confettiRef = useRef<ConfettiCannon | null>(null);

  // Update the progress value when currentStep changes
  useEffect(() => {
    progressValue.value = currentStep;

    // Trigger confetti when quiz is completed
    if (currentStep === maxSteps && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [currentStep, maxSteps, progressValue]);

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
    <View style={styles.progressContainer}>
      <ConfettiCannon
        count={200}
        origin={{ x: 100, y: -200 }}
        explosionSpeed={200}
        fallSpeed={600}
        fadeOut={true}
        colors={["blue", "red", "yellow"]}
        autoStart={false}
        ref={confettiRef}
      />
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
};

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: "center",
    marginVertical: 15,
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
  },
});

export default QuizProgressBar;
