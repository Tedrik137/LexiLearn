import { StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import HomeGrid from "@/components/HomeGrid";

export default function HomeScreen() {
  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <HomeGrid></HomeGrid>
    </CustomScrollView>
  );
}
