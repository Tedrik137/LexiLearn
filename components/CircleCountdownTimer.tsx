import { StyleSheet, Text } from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { ThemedView } from "./ThemedView";
import { useState } from "react";

interface Props {
  onComplete: () => void;
  isPlaying: boolean;
}

const CircleCountdownTimer = ({ onComplete, isPlaying }: Props) => {
  return (
    <ThemedView style={[styles.container]}>
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={60}
        colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
        colorsTime={[7, 5, 2, 0]}
        size={40}
        strokeWidth={6}
        onComplete={() => {
          onComplete();
        }}
      >
        {({ remainingTime }) => <Text>{remainingTime}</Text>}
      </CountdownCircleTimer>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default CircleCountdownTimer;
