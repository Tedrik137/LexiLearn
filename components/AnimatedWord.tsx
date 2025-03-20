import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  SharedValue,
} from "react-native-reanimated";

interface Props {
  word: string;
  selectedWord: SharedValue<string>; // ⬅️ Now using shared value
  setSelectedWord: (word: string) => void;
}

const ANGLE = 10;
const TIME = 100;
const EASING = Easing.elastic(1.5);

export default function AnimatedWord({
  word,
  selectedWord,
  setSelectedWord,
}: Props) {
  const rotation = useSharedValue<number>(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    setSelectedWord(word); // ADDED THIS AND THE ANIMATIONS AREN'T PLAYTING CONSISTENTLY

    selectedWord.value = word; // ⬅️ Updates instantly without delay

    // Play animation immediately
    rotation.value = withSequence(
      withTiming(-ANGLE, { duration: TIME / 2, easing: EASING }),
      withRepeat(
        withTiming(ANGLE, { duration: TIME, easing: EASING }),
        7,
        true
      ),
      withTiming(0, { duration: TIME / 2, easing: EASING })
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Pressable onPress={handlePress}>
          <ThemedText style={{ textAlign: "center" }}>{word}</ThemedText>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#b58df1",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
});
