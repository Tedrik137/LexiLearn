import { StyleSheet, TouchableHighlight } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

interface Props {
  letter: string;
}

export default function LetterSound({ letter }: Props) {
  return (
    <TouchableHighlight
      underlayColor="#303F9F"
      onPress={() => {}}
      style={{ borderRadius: 15 }}
    >
      <ThemedView style={[styles.button]}>
        <ThemedText style={[styles.text]}>{letter}</ThemedText>
        <IconSymbol size={20} name="speaker.3" color={"white"} />
      </ThemedView>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3F51B5",
    width: 40,
    height: 40,
    display: "flex",
    flexDirection: "row",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
});
