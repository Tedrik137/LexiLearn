import React from "react";
import { IconSymbol } from "./ui/IconSymbol";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";

const Avatar = () => {
  return (
    <ThemedView style={styles.avatar}>
      <IconSymbol name="person.fill" color={"white"} size={38}></IconSymbol>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    marginLeft: 10,
    backgroundColor: "transparent",
  },
});

export default Avatar;
