import React, { useState, useRef } from "react";
import { StyleSheet, View, Button } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";

interface Props {
  maxSteps: number;
}

const QuizProgressBar = ({ maxSteps }: Props) => {
  const [, setProgress] = useState(0);
  const progressValue = useSharedValue(0); // Reanimated SharedValue
  const confettiRef = useRef<ConfettiCannon | null>(null);

  // Automatically update animation when progressValue changes
  const progressBarWidth = useDerivedValue(() => {
    return withTiming((progressValue.value / maxSteps) * 200, {
      duration: 300,
    });
  });

  // Animated style for the progress bar
  const progressBarAnimationStyle = useAnimatedStyle(() => ({
    width: progressBarWidth.value,
  }));

  const handlePress = () => {
    setProgress((prev) => {
      const newProgress = prev + 1;
      progressValue.value = newProgress; // Reanimated updates automatically

      if (newProgress === maxSteps && confettiRef.current) {
        confettiRef.current.start();
      }
      return newProgress;
    });
  };

  return (
    <View>
      <ConfettiCannon
        count={200} // More confetti for visibility
        origin={{ x: 100, y: -200 }} // Adjusted origin for better placement
        explosionSpeed={200} // Slower explosion for better effect
        fallSpeed={600} // Slower fall for longer visibility
        fadeOut={true}
        colors={["blue", "red", "yellow"]} // More colors for a lively effect
        autoStart={false}
        ref={confettiRef} // Store ref
      />
      <View style={styles.outerContainer}>
        <Animated.View
          style={[styles.innerContainer, progressBarAnimationStyle]}
        />
      </View>
      <Button onPress={handlePress} title="Click Me" />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "#e8ebed",
    height: 10,
    borderRadius: 4,
    width: 200,
  },
  innerContainer: {
    backgroundColor: "blue",
    height: 10,
    borderRadius: 4,
  },
});

export default QuizProgressBar;
