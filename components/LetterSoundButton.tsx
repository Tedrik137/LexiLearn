import { Animated, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  selected: boolean;
}

export default function LetterSoundButton({
  onPress,
  children,
  size = 40,
  selected,
}: Props) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 1.2,
      duration: 100,
      useNativeDriver: true,
    }).start();

    onPress();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.button,
          { transform: [{ scale: scaleValue }], width: size, height: size },
          selected
            ? {
                backgroundColor: "green",
                borderWidth: 2,
                borderColor: "darkgreen",
                borderStyle: "solid",
              }
            : { backgroundColor: "#3F51B5" },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3F51B5",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 2,
  },
});
