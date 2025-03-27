import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import AnimatedWord from "./AnimatedWord";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface Props {
  sentence: string;
  setSelectedWord: (word: string) => void;
}

export default function SelectableSentence({
  sentence,
  setSelectedWord,
}: Props) {
  // React state for selected word
  const [selectedWordId, setSelectedWordId] = useState<string>("");

  // Shared value for animation control
  const lastAnimatedWord = useSharedValue<string>("");

  // Handle word selection
  const handleWordSelect = (word: string, uniqueId: string) => {
    if (uniqueId === lastAnimatedWord.value) {
      lastAnimatedWord.value = "";
      setTimeout(() => {
        lastAnimatedWord.value = uniqueId;
      }, 50);
    } else {
      lastAnimatedWord.value = uniqueId;
    }

    // Update React state
    setSelectedWordId(uniqueId);

    // Call the parent's callback
    setSelectedWord(word);
  };

  // Split the sentence once
  const words = sentence.split(" ");

  return (
    <ThemedView style={styles.container}>
      {words.map((word, index) => (
        <AnimatedWord
          key={uuidv4()}
          word={word}
          uniqueId={`${word}-${index}`} // Add unique identifier
          onSelect={(selectedWord) =>
            handleWordSelect(selectedWord, `${word}-${index}`)
          }
          lastAnimatedWord={lastAnimatedWord}
          isSelected={`${word}-${index}` === selectedWordId}
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
