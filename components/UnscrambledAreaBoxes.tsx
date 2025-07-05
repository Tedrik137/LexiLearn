import { Letter } from "./ScrambledWordQuizGrid";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";

interface Props {
  scrambledLetters: (Letter | null)[];
  onLetterPress: (letter: Letter, unscrambledIndex: number) => void;
}

const UnscrambledAreaBoxes = ({ scrambledLetters, onLetterPress }: Props) => {
  return (
    <ThemedView style={styles.container}>
      {scrambledLetters.map((letter, index) => (
        <Pressable
          key={uuidv4()}
          onPress={() => {
            if (letter) {
              onLetterPress(letter, index);
            }
          }}
          style={[styles.areaBox]}
          disabled={!letter} // Disable if letter is null
        >
          <ThemedView style={[styles.areaBoxContainer]}>
            {letter && (
              <ThemedText style={[styles.letter]}>{letter.char}</ThemedText>
            )}
          </ThemedView>
        </Pressable>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 15,
    minHeight: 75, // Give the container a minimum height
  },
  areaBox: {
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  areaBoxContainer: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "lightgrey",
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

export default UnscrambledAreaBoxes;
