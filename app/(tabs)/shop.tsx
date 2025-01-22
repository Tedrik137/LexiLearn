import { StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function ShopScreen() {
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
