import { StyleSheet } from "react-native";

import CustomScrollView from "@/components/CustomScrollView";
import ProfileGrid from "@/components/ProfileGrid";

export default function ProfileScreen() {
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
