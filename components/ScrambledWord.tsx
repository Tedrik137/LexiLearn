import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { Letter } from "./ScrambledWordQuizGrid";

interface Props {
  scrambledLetters: (Letter | null)[];
  onLetterPress: (letter: Letter) => void;
}

const ScrambledWord = ({ scrambledLetters, onLetterPress }: Props) => {
  return (
    <ThemedView style={styles.container}>
      {scrambledLetters.map((letter) => (
        <Pressable
          onPress={() => {
            if (letter) {
              onLetterPress(letter);
            }
          }}
          key={uuidv4()}
          style={[styles.button, !letter && styles.buttonDisabled]}
          disabled={!letter} // Disable if letter is null
        >
          {letter && (
            <ThemedText style={[styles.letter]}>{letter.char}</ThemedText>
          )}
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
    backgroundColor: "transparent", // Make used letters invisible
  },
  letter: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

export default ScrambledWord;
