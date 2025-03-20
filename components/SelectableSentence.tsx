import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import AnimatedWord from "./AnimatedWord";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

interface Props {
  sentence: string;
  setSelectedWord: (word: string) => void;
}

export default function SelectableSentence({
  sentence,
  setSelectedWord,
}: Props) {
  const sharedSelectedWord = useSharedValue<string>(""); // ⬅️ Shared value for immediate updates

  return (
    <ThemedView style={styles.container}>
      {sentence.split(" ").map((word, index) => (
        <AnimatedWord
          key={uuidv4()}
          word={word}
          selectedWord={sharedSelectedWord}
          setSelectedWord={setSelectedWord}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    marginTop: 30,
  },
});
