import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Svg, Circle } from "react-native-svg";

const NUM_CONFETTI = 200; // Number of confetti particles
const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const ANIMATION_DURATION = 3000; // Total duration in ms
const FADE_OUT_DURATION = 800; // Duration for fade out effect

// Get a reasonable offset for particles to start above the screen
const OFFSCREEN_OFFSET = -Math.max(50, windowHeight * 0.2);

const Confetti = () => {
  // Control the opacity of the entire container
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Start fade out slightly before the full duration
    const fadeOutDelay = ANIMATION_DURATION - FADE_OUT_DURATION;

    // Fade out the container
    const fadeOutTimer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_OUT_DURATION });
    }, fadeOutDelay);

    return () => clearTimeout(fadeOutTimer);
  }, []);

  // Create animated style for the container opacity
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[styles.container, containerAnimatedStyle]}
      pointerEvents="none"
    >
      {Array.from({ length: NUM_CONFETTI }).map((_, index) => (
        <ConfettiParticle key={index} delay={index * 15} />
      ))}
    </Animated.View>
  );
};

const ConfettiParticle = ({ delay }: { delay: number }) => {
  // Start above the visible screen area with a responsive value
  const translateY = useSharedValue(OFFSCREEN_OFFSET);

  // Initial X position
  const initialX = Math.random() * windowWidth;
  const translateX = useSharedValue(initialX);

  const rotation = useSharedValue(Math.random() * 360);

  // Random horizontal movement amplitude (positive or negative)
  const xAmplitude = (Math.random() - 0.5) * 100;

  useEffect(() => {
    // Faster vertical movement (reduced duration)
    translateY.value = withDelay(
      delay,
      withTiming(windowHeight + 50, {
        duration: 1400, // Faster fall
        easing: Easing.quad,
      })
    );

    // Add horizontal movement (swaying left and right)
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(initialX + xAmplitude, {
          duration: 900,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(initialX - xAmplitude, {
          duration: 900,
          easing: Easing.inOut(Easing.sin),
        })
      )
    );

    // Faster rotation
    rotation.value = withDelay(
      delay,
      withTiming(rotation.value + 720, { duration: 1800 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Svg height="10" width="10">
        <Circle cx="5" cy="5" r="5" fill={getRandomColor()} />
      </Svg>
    </Animated.View>
  );
};

// Function to generate random colors
const getRandomColor = () => {
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: windowWidth,
    height: windowHeight,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: "absolute",
    width: 10,
    height: 10,
  },
});

export default Confetti;
