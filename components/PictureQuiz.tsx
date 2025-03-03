import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import PictureButtonGrid from "./PictureButtonGrid";

const tree = require("../assets/images/tree.jpg");

const PictureQuiz = () => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1250 }); // Fade-in over 1.5s
    scale.value = withTiming(1, { duration: 750 }); // Scale-in over 1s
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image style={styles.image} source={tree} contentFit="cover" />
      </Animated.View>
      <ThemedText>Match the word with the image:</ThemedText>
      <PictureButtonGrid language={"en-au"} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    borderRadius: 16, // Optional rounded edges
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 300,
  },
});

export default PictureQuiz;
