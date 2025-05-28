import React, { useState } from "react";
import { GestureResponderEvent, Pressable, StyleSheet } from "react-native";
import Animated, { // Import Animated from 'react-native-reanimated'
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { Language } from "@/types/languages";

interface Props {
  language: Language;
  setModalVisible: (visible: boolean) => void;
  setLanguage: (language: Language) => void;
}

export default function ModalButton({
  language,
  setModalVisible,
  setLanguage,
}: Props) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withTiming(1.2, { duration: 200 });
    setModalVisible(true);
    setLanguage(language);
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
        <ThemedText>{language.name}</ThemedText>
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
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
