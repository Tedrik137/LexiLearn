import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import Header from "./Header";

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  padding?: number;
  canPopNavigation?: boolean;
}>;

export default function CustomScrollView({
  children,
  padding = 32,
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
        <ThemedView style={[styles.content, { padding: padding }]}>
          {children}
        </ThemedView>
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
    gap: 16,
    overflow: "hidden",
  },
});
