import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { IconSymbol } from "./ui/IconSymbol";
import Avatar from "./Avatar";
import HeaderXPDisplay from "./HeaderXPDisplay";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "./ThemedText";

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  canPopNavigation?: boolean;
}>;

const HEADER_HEIGHT = 75;

const Header = ({ headerBackgroundColor, canPopNavigation = false }: Props) => {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const selectedLanguage = useAuthStore((state) => state.selectedLanguage);
  const user = useAuthStore((state) => state.user);

  return (
    <Animated.View
      style={[
        styles.header,
        { backgroundColor: headerBackgroundColor[colorScheme] },
      ]}
    >
      {!user ? (
        <ThemedText style={{ marginTop: 6, fontSize: 24, color: "#2d3030" }}>
          LexiLearn!
        </ThemedText>
      ) : (
        <>
          {canPopNavigation && (
            <Pressable
              onPress={() => {
                router.back();
              }}
              style={[styles.chevron]}
            >
              <IconSymbol
                name="chevron.left"
                size={32}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </Pressable>
          )}
          <Avatar />
          {selectedLanguage && <HeaderXPDisplay />}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chevron: {
    position: "absolute",
    left: 16,
    top: (HEADER_HEIGHT + 12) / 2 - 32 / 2,
  },
});

export default Header;
