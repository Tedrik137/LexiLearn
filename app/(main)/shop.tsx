import { StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuthStore } from "@/stores/authStore";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function ShopScreen() {
  const setSelectedLanguage = useAuthStore(
    (state) => state.setSelectedLanguage
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedLanguage(null);
      return () => {};
    }, [setSelectedLanguage])
  );

  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    ></CustomScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
