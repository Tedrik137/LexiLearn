import { Image, StyleSheet, Platform, Pressable } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import LoginForm from "@/components/LoginForm";
import SignUpForm from "@/components/SignupForm";
import { useState } from "react";

export default function AccountScreen() {
  const [authMode, setAuthMode] = useState("signUp");

  const toggleAuthMode = () => {
    setAuthMode((prevAuthMode) =>
      prevAuthMode === "signUp" ? "login" : "signUp"
    );
  };

  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.modeToggleContainer}>
        <Pressable
          style={[
            styles.modeButton,
            authMode === "signUp" && styles.activeMode,
          ]}
          onPress={() => authMode !== "signUp" && toggleAuthMode()}
        >
          <ThemedText style={styles.modeButtonText}>Sign Up</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.modeButton, authMode === "login" && styles.activeMode]}
          onPress={() => authMode !== "login" && toggleAuthMode()}
        >
          <ThemedText style={styles.modeButtonText}>Login</ThemedText>
        </Pressable>
      </ThemedView>
      {authMode === "signUp" && <SignUpForm />}
      {authMode === "login" && <LoginForm />}
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  modeToggleContainer: {
    flexDirection: "row",
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignSelf: "center",
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  activeMode: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    fontWeight: "500",
    color: "#333",
  },
});
