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
  useAnimatedReaction,
  cancelAnimation,
} from "react-native-reanimated";

interface Props {
  word: string;
  uniqueId: string;
  onSelect: (word: string) => void;
  lastAnimatedWord: SharedValue<string>;
  isSelected: boolean;
  disabled: boolean;
}

const ROTATION_TIME = 75;
const BACKGROUND_TIME = 2500;
const EASING = Easing.elastic(1.5);

export default function AnimatedWord({
  word,
  uniqueId,
  onSelect,
  lastAnimatedWord,
  isSelected,
  disabled,
}: Props) {
  const ANGLE = word.length > 5 ? 3 : 5;
  const rotation = useSharedValue<number>(0);
  const background = useSharedValue<string>("#66afff");
  const scale = useSharedValue<number>(1.0);

  // Animated style for rotation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    backgroundColor: background.value,
  }));

  // React to changes in the lastAnimatedWord shared value
  useAnimatedReaction(
    () => lastAnimatedWord.value,
    (currentAnimatedWord, previousAnimatedWord) => {
      // If this is the word that was just selected
      if (currentAnimatedWord === uniqueId) {
        // Start the animation
        rotation.value = withSequence(
          withTiming(-ANGLE, { duration: ROTATION_TIME / 2, easing: EASING }),
          withRepeat(
            withTiming(ANGLE, { duration: ROTATION_TIME, easing: EASING }),
            7,
            true
          ),
          withTiming(0, { duration: ROTATION_TIME / 2, easing: EASING })
        );

        background.value = withTiming("lightgreen", {
          duration: BACKGROUND_TIME,
          easing: EASING,
        });

        scale.value = withTiming(1.1, {
          duration: BACKGROUND_TIME,
          easing: EASING,
        });
      }
      // If this was the previously animated word, reset it
      else if (previousAnimatedWord === uniqueId && rotation.value !== 0) {
        cancelAnimation(rotation);
        cancelAnimation(background);
        rotation.value = withTiming(0, { duration: 50 });
        background.value = withTiming("#66afff", { duration: 50 });
        scale.value = withTiming(1.0, { duration: 50 });
      }
    }
  );

  // Handle press
  const handlePress = () => {
    onSelect(word);
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      style={[styles.pressableContainer]}
    >
      <ThemedView style={styles.container}>
        <Animated.View
          style={[styles.box, animatedStyle, isSelected && styles.selected]}
        >
          <ThemedText style={{ textAlign: "center" }}>{word}</ThemedText>
        </Animated.View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  selected: {
    borderWidth: 1,
    borderColor: "#1c1c1c",
  },
  pressableContainer: {
    alignSelf: "flex-start",
  },
});
