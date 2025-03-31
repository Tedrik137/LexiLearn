import { create } from "zustand";
import { User } from "firebase/auth";
import AuthService from "../services/authService";
import { auth } from "@/firebaseConfig";

interface AuthState {
  // State
  user: User | null;
  initializing: boolean;
  loading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setInitializing: (initializing: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Auth operations
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

  // Initialize auth listener
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  initializing: true,
  loading: false,

  // State setters
  setUser: (user) => set({ user }),
  setInitializing: (initializing) => set({ initializing }),
  setLoading: (loading) => set({ loading }),

  // Auth operations
  signUp: async (email, password, displayName) => {
    set({ loading: true });
    try {
      const result = await AuthService.signUp(email, password, displayName);
      return result;
    } catch (error) {
      return { success: false, error: "Sign up failed" };
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const result = await AuthService.signIn(email, password);
      return result;
    } catch (error) {
      return { success: false, error: "Sign in failed" };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const result = await AuthService.signOutUser();
      return result;
    } catch (error) {
      return { success: false, error: "Sign out failed" };
    } finally {
      set({ loading: false });
    }
  },

  // Initialize the auth listener
  initializeAuthListener: () => {
    // Setup the auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      set({ user });
      if (get().initializing) set({ initializing: false });
    });

    // Return unsubscribe function to be used in cleanup
    return unsubscribe;
  },
}));
