import { ThemedText } from "./ThemedText";
import { Pressable, StyleSheet, ScrollView } from "react-native"; // Import ScrollView
import { Letter } from "./ScrambledWordQuizGrid";
import { useEffect, useRef } from "react";

interface Props {
  scrambledLetters: (Letter | null)[];
  onLetterPress: (letter: Letter) => void;
  direction: "ltr" | "rtl";
}

const ScrambledWord = ({
  scrambledLetters,
  onLetterPress,
  direction,
}: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (direction === "rtl") {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }
  }, [scrambledLetters, direction]);

  return (
    <ScrollView
      ref={scrollViewRef} // Assign the ref
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={styles.container}
    >
      {scrambledLetters.map((letterObj, index) => (
        <Pressable
          onPress={() => letterObj && onLetterPress(letterObj)}
          key={index}
          style={[styles.button, !letterObj && styles.buttonDisabled]}
          disabled={!letterObj}
        >
          {letterObj && (
            <ThemedText style={[styles.letter]}>{letterObj.char}</ThemedText>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    gap: 15,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: "lightblue",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "transparent",
  },
  letter: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

export default ScrambledWord;
