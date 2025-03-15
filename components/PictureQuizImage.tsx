import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

interface Props {
  currentTarget: string;
  isImageLoading: boolean;
  currentQuestion: number;
}

export default function PictureQuizImage({
  currentTarget,
  isImageLoading,
  currentQuestion,
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

    // opacity.value = withTiming(1, { duration: 1250 });
    // scale.value = withTiming(1, { duration: 750 });
  }, [currentTarget, currentQuestion]);

  // Screen width
  const screenWidth = Dimensions.get("window").width * 0.9;
  const maxHeight = 250;

  if (isImageLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading image...</ThemedText>
      </ThemedView>
    );
  }

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
        onLoadStart={() => (opacity.value = 0)} // Hide until loading starts
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

          opacity.value = withTiming(1, { duration: 1250 });
          scale.value = withTiming(1, { duration: 750 });
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },
});
