import { Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  selected: boolean;
  disabled: boolean;
  width?: number;
  height?: number;
  size: number;
}

export default function LanguageModalButton({
  onPress,
  children,
  selected,
  disabled,
  width,
  height,
  size,
}: Props) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withTiming(1.2, { duration: 200 });
    onPress();
  };

  const handlePressOut = () => {
    scaleValue.value = withTiming(1, { duration: 200 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          [{ width: width ? width : size, height: height ? height : size }],
          selected
            ? {
                backgroundColor: "green",
                borderWidth: 2,
                borderColor: "darkgreen",
                borderStyle: "solid",
              }
            : { backgroundColor: "#3F51B5" },
          disabled && { backgroundColor: "#8d9efc" },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 2,
  },
});
