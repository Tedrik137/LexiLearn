import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
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
  onImageLoaded: () => void;
}

export default function PictureQuizImage({
  currentTarget,
  isImageLoading,
  currentQuestion,
  onImageLoaded,
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
    // When the image source changes, reset the animation values.
    opacity.value = 0;
    scale.value = 0.8;
  }, [currentTarget, currentQuestion]);

  const screenWidth = useWindowDimensions().width * 0.9;
  const maxHeight = 250;

  // FIX: The component now always returns the same structure.
  // The spinner is an overlay controlled by the `isImageLoading` prop.
  return (
    <ThemedView style={[styles.container, { height: maxHeight }]}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image
          source={currentTarget}
          style={[
            styles.image,
            imageSize
              ? { width: imageSize.width, height: imageSize.height }
              : { width: screenWidth, height: maxHeight },
          ]}
          contentFit="contain"
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

            // Start the fade-in animation
            opacity.value = withTiming(1, { duration: 500 });
            scale.value = withTiming(1, { duration: 500 });

            // CRITICAL FIX: Notify the parent that loading is complete.
            onImageLoaded();
          }}
        />
      </Animated.View>

      {/* The spinner is now an overlay that shows/hides based on the prop */}
      {isImageLoading && (
        <ThemedView style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading image...</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  imageWrapper: {
    overflow: "hidden",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  image: {
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    // Use the component's background color to hide the image loading underneath
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },
});
