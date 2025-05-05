import { create } from "zustand";
import { User } from "firebase/auth";
import AuthService from "../services/authService";
import { auth, firestore } from "@/firebaseConfig"; // Ensure firestore is exported from your config
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  DocumentData,
} from "firebase/firestore"; // Import Firestore functions

// Define an interface for your Firestore user data structure
interface FirestoreUserData extends DocumentData {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt?: any; // Consider using Firestore Timestamp type if possible
  xp?: number;
  currentStreak?: number;
  // Add any other fields you store in Firestore
}

interface AuthState {
  // State
  user: User | null; // Firebase Auth User
  firestoreUser: FirestoreUserData | null; // Firestore User Data
  initializing: boolean;
  loading: boolean; // Consider separate loading states if needed (e.g., authLoading, firestoreLoading)

  // Actions
  setUser: (user: User | null) => void;
  setFirestoreUser: (firestoreUser: FirestoreUserData | null) => void; // New setter
  setInitializing: (initializing: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Auth operations
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string; user?: User | null }>; // Ensure signUp returns user
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User | null }>; // Ensure signIn returns user
  signOut: () => Promise<{ success: boolean; error?: string }>;

  // Firestore operations
  updateUserXP: (xpGained: number) => Promise<void>; // Action to update XP

  // Initialize auth listener
  initializeAuthListener: () => () => void; // Returns the unsubscribe function
}

export const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeFirestore: (() => void) | null = null; // Store Firestore listener cleanup

  return {
    // Initial state
    user: null,
    firestoreUser: null,
    initializing: true,
    loading: false,

    // State setters
    setUser: (user) => set({ user }),
    setFirestoreUser: (firestoreUser) => set({ firestoreUser }),
    setInitializing: (initializing) => set({ initializing }),
    setLoading: (loading) => set({ loading }),

    // Auth operations
    signUp: async (email, password, displayName) => {
      set({ loading: true });
      try {
        const result = await AuthService.signUp(email, password, displayName);
        // The listener will handle setting user and firestoreUser state
        return result; // Return the result which includes the user object
      } catch (error: any) {
        return { success: false, error: error.message || "Sign up failed" };
      } finally {
        set({ loading: false });
      }
    },

    signIn: async (email, password) => {
      set({ loading: true });
      try {
        const result = await AuthService.signIn(email, password);
        // The listener will handle setting user and firestoreUser state
        return result; // Return the result which includes the user object
      } catch (error: any) {
        return { success: false, error: error.message || "Sign in failed" };
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true });
      try {
        const result = await AuthService.signOutUser();
        // Listener will set user/firestoreUser to null
        return result;
      } catch (error: any) {
        return { success: false, error: error.message || "Sign out failed" };
      } finally {
        set({ loading: false });
      }
    },

    // Firestore operations
    updateUserXP: async (xpGained) => {
      const uid = get().user?.uid;
      if (!uid) {
        console.error("Cannot update XP: User not logged in.");
        return;
      }
      if (xpGained <= 0) {
        console.log("No XP gained.");
        return;
      }

      const userDocRef = doc(firestore, "users", uid);
      try {
        await updateDoc(userDocRef, {
          xp: increment(xpGained),
        });
        console.log(`XP updated by ${xpGained} for user ${uid}`);
        // No need to manually set state here if the listener is active
      } catch (error) {
        console.error(`Error updating XP for user ${uid}:`, error);
        // Optionally try to refetch if listener failed?
      }
    },

    // Initialize the auth listener
    initializeAuthListener: () => {
      console.log("Initializing Auth Listener...");
      const unsubscribeAuth = auth.onAuthStateChanged(async (authUser) => {
        console.log("Auth State Changed:", authUser?.uid);
        // Clean up previous Firestore listener
        if (unsubscribeFirestore) {
          console.log("Unsubscribing previous Firestore listener.");
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }

        if (authUser) {
          // User is signed in
          let finalUser = authUser;
          // Attempt reload if display name is missing (might happen right after signup)
          if (!finalUser.displayName) {
            try {
              console.log("Reloading user to get displayName...");
              await finalUser.reload();
              finalUser = auth.currentUser || finalUser; // Use the potentially updated user object
            } catch (error) {
              console.error("Failed to reload user during auth init:", error);
            }
          }
          set({ user: finalUser }); // Set Auth user state

          // Set up Firestore listener for real-time updates
          const userDocRef = doc(firestore, "users", finalUser.uid);
          console.log(
            `Setting up Firestore listener for user: ${finalUser.uid}`
          );
          unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                console.log(
                  `Firestore data received for ${finalUser.uid}:`,
                  docSnap.data()
                );
                set({ firestoreUser: docSnap.data() as FirestoreUserData });
              } else {
                // This case might happen if the Firestore document creation (e.g., by cloud function) is delayed
                console.warn(
                  `Firestore document for user ${finalUser.uid} does not exist yet.`
                );
                set({ firestoreUser: null });
                // Consider fetching manually once after a short delay if the function is known to be slow
              }
              if (get().initializing) set({ initializing: false });
            },
            (error) => {
              console.error(
                `Firestore snapshot error for user ${finalUser.uid}:`,
                error
              );
              set({ firestoreUser: null }); // Clear data on error
              if (get().initializing) set({ initializing: false });
            }
          );
        } else {
          // User is signed out
          console.log("User signed out.");
          set({ user: null, firestoreUser: null });
          if (get().initializing) set({ initializing: false });
        }
      });

      // Return a function that unsubscribes both listeners on cleanup
      return () => {
        console.log("Cleaning up auth and Firestore listeners.");
        unsubscribeAuth();
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
        }
      };
    },
  };
});
