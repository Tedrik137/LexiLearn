import CustomScrollView from "@/components/CustomScrollView";
import HomeGrid from "@/components/HomeGrid";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFocusEffect } from "expo-router";

export default function HomeScreen() {
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
      <HomeGrid></HomeGrid>
    </CustomScrollView>
  );
}
