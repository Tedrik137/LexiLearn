import { Image, StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useAuthStore } from "@/stores/authStore";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView>
        <ThemedText>Home Screen Content {user?.displayName}</ThemedText>
      </ThemedView>
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
