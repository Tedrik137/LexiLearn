import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "./ThemedText"; // Or your text component
import LevelProgressBar from "./LevelProgressBat";

export default function HeaderXPDisplay() {
  const isLoading = useAuthStore(
    (state) => state.initializing || state.loading
  );

  if (isLoading) return <ThemedText>Loading...</ThemedText>;

  return <LevelProgressBar />;
}
