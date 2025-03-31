import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function Index() {
  const user = useAuthStore((state) => state.user);

  // Redirect based on authentication state
  return <Redirect href={user ? "/(main)" : "/(auth)"} />;
}
