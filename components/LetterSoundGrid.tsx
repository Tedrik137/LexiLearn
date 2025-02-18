import { StyleSheet, TouchableHighlight } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";
import LetterSound from "./LetterSound";

interface Props {
  letters: string[];
}

export default function LetterSoundGrid({ letters }: Props) {
  return (
    <ThemedView style={[styles.container]}>
      {letters.map((letter) => (
        <LetterSound letter={letter} />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
