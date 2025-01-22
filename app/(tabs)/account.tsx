import { StyleSheet } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import SignUpForm from "@/components/SignupForm";
import LoginForm from "@/components/LoginForm";
import CustomScrollView from "@/components/CustomScrollView";
import ProfileGrid from "@/components/ProfileGrid";

export default function AccountScreen() {
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
