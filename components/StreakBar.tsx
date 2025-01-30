import React from "react";
import { ThemedText } from "./ThemedText";

interface Props {
  streak: number;
}

const StreakBar = ({ streak }: Props) => {
  return (
    <ThemedText style={{ marginRight: 10 }}>
      Current Streak: {streak}
    </ThemedText>
  );
};

export default StreakBar;
