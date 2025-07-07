import { useEffect, useRef } from "react";
import { Letter } from "./ScrambledWordQuizGrid";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet, ScrollView } from "react-native"; // Import ScrollView

interface Props {
  scrambledLetters: (Letter | null)[];
  onLetterPress: (letter: Letter, unscrambledIndex: number) => void;
  direction: "ltr" | "rtl";
}

const UnscrambledAreaBoxes = ({
  scrambledLetters,
  onLetterPress,
  direction,
}: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // If the language is RTL, scroll to the end to start from the right
    if (direction === "rtl") {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }
  }, [scrambledLetters, direction]); // Rerun if content or direction changes

  return (
    <ScrollView
      ref={scrollViewRef} // Assign the ref
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={styles.container}
    >
      {scrambledLetters.map((letter, index) => (
        <Pressable
          key={index} // Use index for key as the list order is stable
          onPress={() => {
            if (letter) {
              onLetterPress(letter, index);
            }
          }}
          style={[styles.areaBox]}
          disabled={!letter}
        >
          {letter && (
            <ThemedText style={[styles.letter]}>{letter.char}</ThemedText>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Keep items in a row
    // flexWrap: "wrap", // REMOVE: We no longer want to wrap
    alignItems: "center", // Center items vertically
    paddingVertical: 10,
    paddingHorizontal: 5,
    gap: 15,
    minHeight: 75,
  },
  areaBox: {
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: "lightgrey",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  letter: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

export default UnscrambledAreaBoxes;
