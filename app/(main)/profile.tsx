import { StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import ProfileGrid from "@/components/ProfileGrid";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function ProfileScreen() {
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
    >
      <ProfileGrid></ProfileGrid>
    </CustomScrollView>
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
