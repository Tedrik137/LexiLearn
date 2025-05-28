import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import StreakBar from "./StreakBar";
import Avatar from "./Avatar";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import HeaderXPDisplay from "./HeaderXPDisplay";
import { IconSymbol } from "./ui/IconSymbol";
import { useRouter } from "expo-router";
import Header from "./Header";

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  canPopNavigation?: boolean;
}>;

export default function CustomScrollView({
  children,
  headerBackgroundColor,
  canPopNavigation = false,
}: Props) {
  const bottom = useBottomTabOverflow();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Header
          headerBackgroundColor={headerBackgroundColor}
          canPopNavigation={canPopNavigation}
        />
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
