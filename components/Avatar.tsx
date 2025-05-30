import React from "react";
import { IconSymbol } from "./ui/IconSymbol";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useAuthStore } from "@/stores/authStore";

const Avatar = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <ThemedView style={styles.avatar}>
      <IconSymbol name="person.fill" color={"#007AFF"} size={38} />
      {user && <ThemedText>{user?.displayName}</ThemedText>}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    marginLeft: 10,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
});

export default Avatar;
