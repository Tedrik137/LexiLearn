import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import AuthService from "../services/authService";
import { useRouter, useSegments } from "expo-router";
import { auth } from "@/firebaseConfig";

interface UseAuthHook {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

export const useAuth = (): UseAuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  function onAuthStateChanged(user: User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);

    // Cleanup subscription on unmount
    return subscriber;
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(email, password, displayName);
      return result;
    } catch (error) {
      return { success: false, error: "Sign up failed" };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);
      return result;
    } catch (error) {
      return { success: false, error: "Sign in failed" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signOutUser();
      return result;
    } catch (error) {
      return { success: false, error: "Sign out failed" };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    initializing,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
