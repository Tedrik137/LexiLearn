import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet } from "react-native";
import Animated, { // Import Animated from 'react-native-reanimated'
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { useRouter } from "expo-router";

interface Props {
  buttonText: string;
}

export default function AnimatedNavigationButton({ buttonText }: Props) {
  const scaleValue = useSharedValue(1);
  const router = useRouter();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withTiming(1.2, { duration: 200 });
    // change the path to the desired screen
    setTimeout(() => {
      router.push(`/(main)/profile`);
    }, 150);
  };

  const handlePressOut = () => {
    scaleValue.value = withTiming(1, { duration: 200 });
  };

  return (
    <Animated.View style={[animatedStyle, styles.animatedContainer]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button]}
      >
        <ThemedText>{buttonText}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    margin: 5,
    backgroundColor: "#0045bd",
    width: "45%",
  },
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
