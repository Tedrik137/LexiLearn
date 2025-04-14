import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";

type Props = {
  onPress: () => Promise<void>;
  isLoading: boolean;
  loadingText: string;
  text: string;
  outerBackgroundColor: string;
  innerBackgroundColor: string;
};

export default function AnimatedSignUpButton({
  onPress,
  isLoading,
  text,
  loadingText,
  outerBackgroundColor,
  innerBackgroundColor,
}: Props) {
  const offset = useSharedValue(0);

  const handlePress = async () => {
    offset.value = withRepeat(
      withTiming(200, { duration: 1000 }), // Adjust duration as needed
      -1, // Infinite repeat
      false // No reverse, continuous cycling
    );

    await onPress();

    cancelAnimation(offset);
    offset.value = 0;
  };

  const progressBarAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View style={styles.progressContainer}>
      <Pressable
        style={[
          styles.outerContainer,
          { backgroundColor: outerBackgroundColor },
        ]}
        onPress={handlePress}
      >
        <ThemedText style={[styles.progressText]}>
          {isLoading ? loadingText : text}
        </ThemedText>
        <Animated.View
          style={[
            styles.innerContainer,
            progressBarAnimationStyle,
            { backgroundColor: innerBackgroundColor },
          ]}
        ></Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", // Add shadow color
    shadowOffset: { width: 0, height: 2 }, // Add shadow offset
    shadowOpacity: 0.25, // Add shadow opacity
    shadowRadius: 3.84, // Add shadow radius
    elevation: 5, // Add elevation for Android
  },
  outerContainer: {
    height: 40,
    borderRadius: 3,
    width: 200,
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    elevation: 2,
    marginTop: 10,
    overflow: "hidden", // Ensures child elements do not overflow the container
  },
  innerContainer: {
    height: 40,
    borderRadius: 4,
    width: "50%",
    position: "absolute",
    top: 0,
    left: -100,
    opacity: 0.5,
    zIndex: 1,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "semibold",
    marginTop: 5,
    marginBottom: 5,
    color: "white",
  },
});
