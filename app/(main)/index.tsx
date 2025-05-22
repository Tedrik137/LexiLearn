import { StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import HomeGrid from "@/components/HomeGrid";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function HomeScreen() {
  const setSelectedLanguage = useAuthStore(
    (state) => state.setSelectedLanguage
  );

  useEffect(() => {
    // Set the selected language in the auth store
    setSelectedLanguage(null);
  }, [setSelectedLanguage]);
  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <HomeGrid></HomeGrid>
    </CustomScrollView>
  );
}
