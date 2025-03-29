import React from "react";
import { IconSymbol } from "./ui/IconSymbol";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { ThemedText } from "./ThemedText";

const Avatar = () => {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.avatar}>
      <IconSymbol name="person.fill" color={"white"} size={38} />
      {user && <ThemedText>{user?.displayName}</ThemedText>}
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
