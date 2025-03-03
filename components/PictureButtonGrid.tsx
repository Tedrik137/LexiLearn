import LetterSoundButton from "./LetterSoundButton";
import { playSound } from "@/utils/audioUtils";
import { IconSymbol } from "./ui/IconSymbol";
import { LanguageCode } from "@/types/soundTypes";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
interface Props {
  language: LanguageCode;
}

const PictureButtonGrid = ({ language }: Props) => {
  return (
    <ThemedView style={[styles.column]}>
      <ThemedView style={[styles.container]}>
        <LetterSoundButton
          onPress={() => playSound("tree", language)}
          size={100}
          selected={false}
        >
          <ThemedText style={styles.buttonText}>Tree</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
        <LetterSoundButton
          onPress={() => playSound("house", language)}
          size={100}
          selected={false}
        >
          <ThemedText style={styles.buttonText}>House</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
      </ThemedView>
      <ThemedView style={[styles.container]}>
        <LetterSoundButton
          onPress={() => playSound("ball", language)}
          size={100}
          selected={false}
        >
          <ThemedText style={styles.buttonText}>Ball</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
        <LetterSoundButton
          onPress={() => playSound("sun", language)}
          size={100}
          selected={false}
        >
          <ThemedText style={styles.buttonText}>Sun</ThemedText>
          <IconSymbol size={20} name="speaker.3" color="white" />
        </LetterSoundButton>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-evenly",
  },
  column: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
});

export default PictureButtonGrid;
