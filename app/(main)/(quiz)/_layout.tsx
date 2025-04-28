import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Slot></Slot>
    </ThemedView>
  );
}
