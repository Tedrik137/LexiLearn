import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  currentQuestion: number;
  currentTarget: string;
}

export default function PictureQuizImage({
  currentQuestion,
  currentTarget,
}: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    opacity.value = 0;
    scale.value = 0.8;

    opacity.value = withTiming(1, { duration: 1250 });
    scale.value = withTiming(1, { duration: 750 });
  }, [currentQuestion]);

  // Screen width
  const screenWidth = Dimensions.get("window").width * 0.9;
  const maxHeight = 250;

  return (
    <Animated.View style={[styles.imageWrapper, animatedStyle]}>
      <Image
        source={currentTarget}
        style={[
          styles.image,
          imageSize
            ? { width: imageSize.width, height: imageSize.height }
            : { width: screenWidth, height: maxHeight },
        ]}
        contentFit="contain" // Ensures the entire image is visible without cropping
        onLoad={(event) => {
          const { width, height } = event.source;
          const aspectRatio = width / height;

          let newWidth = screenWidth;
          let newHeight = screenWidth / aspectRatio;

          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = maxHeight * aspectRatio;
          }

          setImageSize({ width: newWidth, height: newHeight });
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    overflow: "hidden",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 20,
    width: "100%",
  },
  image: {
    borderRadius: 16,
  },
});
