import { useAuthStore } from "@/stores/authStore";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";

export default function AuthObserver({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const segments = useSegments();
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    // Skip redirection if still initializing
    const initializing = useAuthStore.getState().initializing;
    if (initializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inMainGroup = segments[0] === "(main)";

    // Check if we have a user but the display name is missing
    if (user && !user.displayName) {
      setProfileComplete(false);

      // Try to refresh the user data to get the display name
      if (auth.currentUser) {
        auth.currentUser
          .reload()
          .then(() => {
            if (auth.currentUser?.displayName) {
              setUser(auth.currentUser);
              setProfileComplete(true);
            }
          })
          .catch((error) => {
            console.error("Failed to reload user: ", error);
          });
      }
      return;
    }

    // Only proceed with navigation if profile is complete
    if (!user && !inAuthGroup) {
      // If user is not signed in and not on an auth page, redirect to auth
      router.replace("/(auth)");
    } else if (user && !inMainGroup && profileComplete) {
      // If user is signed in, profile is complete, and not on a main app page, redirect to main
      router.replace("/(main)");
    }
  }, [user, segments, router, profileComplete]);

  return <>{children}</>;
}
