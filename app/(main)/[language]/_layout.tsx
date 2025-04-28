import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Slot, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[quiz]" options={{ headerShown: false }} />
      </Stack>
    </ThemedView>
  );
}
