import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import AnimatedWord from "./AnimatedWord";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { ThemedText } from "./ThemedText";
import { playSound } from "@/utils/audioUtils";
import LetterSoundButton from "./LetterSoundButton";
import { IconSymbol } from "./ui/IconSymbol";

interface Props {
  sentence: string[];
  showFeedback: boolean;
  handleAnswerSubmit: (selectedWord: string) => void;
  quizMode: string;
  currentTarget: string;
  isQuestionTransitioning: boolean;
}

export default function SelectableSentence({
  sentence,
  showFeedback,
  handleAnswerSubmit,
  quizMode,
  currentTarget,
  isQuestionTransitioning,
}: Props) {
  // React state for selected word
  const [selectedWordId, setSelectedWordId] = useState<string>("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Shared value for animation control
  const lastAnimatedWord = useSharedValue<string>("");

  // Handle word selection
  const handleWordSelect = (word: string, uniqueId: string) => {
    if (isQuestionTransitioning) return;

    if (uniqueId === lastAnimatedWord.value) {
      lastAnimatedWord.value = "";
      setTimeout(() => {
        lastAnimatedWord.value = uniqueId;
      }, 50);
    } else {
      lastAnimatedWord.value = uniqueId;
    }

    if (quizMode === "practice") {
      playSound(word, "en-au");
    }
    // Update React state
    setSelectedWordId(uniqueId);
    setSelectedWord(word);
  };

  const handleSubmit = () => {
    if (isQuestionTransitioning) return;

    if (selectedWord === null) return;

    lastAnimatedWord.value = "";
    handleAnswerSubmit(selectedWord);
    setSelectedWord(null);
    setSelectedWordId("");
  };

  return (
    <ThemedView style={styles.column}>
      <ThemedView style={styles.container}>
        {sentence.map((word, index) => (
          <AnimatedWord
            key={uuidv4()}
            word={word}
            uniqueId={`${word}-${index}`} // Add unique identifier
            onSelect={(selectedWord) =>
              handleWordSelect(selectedWord, `${word}-${index}`)
            }
            lastAnimatedWord={lastAnimatedWord}
            isSelected={`${word}-${index}` === selectedWordId}
            disabled={isQuestionTransitioning}
          />
        ))}
      </ThemedView>

      <ThemedView style={styles.targetSoundContainer}>
        <LetterSoundButton
          onPress={() => playSound(currentTarget, "en-au")}
          size={80}
          selected={false}
          disabled={showFeedback}
        >
          <IconSymbol size={24} name="speaker.3" color="white" />
        </LetterSoundButton>
        <ThemedText style={styles.helpText}>
          Tap to hear the sound again
        </ThemedText>
        <Pressable
          style={[
            styles.pressable,
            {
              opacity: selectedWord === null || showFeedback ? 0.5 : 1,
            },
            selectedWord !== null &&
              showFeedback && {
                borderWidth: 2,
                borderColor: "blue",
              },
          ]}
          disabled={selectedWord === null || showFeedback}
          onPress={() => {
            handleSubmit();
          }}
        >
          <ThemedText style={styles.submitButtonText}>
            {selectedWord ? `Submit "${selectedWord}"` : "Pick a word"}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
  },
  container: {
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    marginTop: 25,
    marginBottom: 25,
  },
  pressable: {
    backgroundColor: "lightgreen",
    borderRadius: 10,
    marginTop: 15,
    padding: 15,
    paddingHorizontal: 25,
    minWidth: 150,
    alignItems: "center",
  },
  submitButtonText: {
    fontWeight: "500",
    fontSize: 16,
  },
  targetSoundContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
  },
});
