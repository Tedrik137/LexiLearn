import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "./ThemedText"; // Or your text component

export default function HeaderXPDisplay() {
  const firestoreUser = useAuthStore((state) => state.firestoreUser);

  const isLoading = useAuthStore(
    (state) => state.initializing || state.loading
  );

  if (isLoading) return <ThemedText>Loading...</ThemedText>;

  return <ThemedText>XP: {firestoreUser?.xp ?? 0}</ThemedText>;
}
