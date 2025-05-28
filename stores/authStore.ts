import { create } from "zustand";
import { User } from "firebase/auth";
import AuthService from "../services/authService";
import { auth, firestore } from "@/firebaseConfig"; // Ensure firestore is exported from your config
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  setDoc,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore"; // Import Firestore functions
import { checkLevelUp } from "@/utils/XP";
import { LanguageCode } from "@/types/languages";

interface LanguageProgress {
  xp: number;
  level: number;
  languageCode: LanguageCode;
}

interface AuthState {
  // State
  user: User | null; // Firebase Auth User
  initializing: boolean;
  loading: boolean; // Consider separate loading states if needed (e.g., authLoading, firestoreLoading)
  currentLanguageProgress: LanguageProgress | null; // Current language progress
  selectedLanguage: LanguageCode | null; // Currently selected language for progress
  // Actions
  setUser: (user: User | null) => void;
  setInitializing: (initializing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSelectedLanguage: (languageCode: LanguageCode | null) => void; // Set selected language for progress

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

  fetchUserLanguageProgress: (languageCode: LanguageCode) => Promise<void>; // Action to fetch user language progress

  // Initialize auth listener
  initializeAuthListener: () => () => void; // Returns the unsubscribe function
  clearLanguageProgressListener: () => void; // Function to clear the language progress listener
}

export const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeLanguageProgressListener: (() => void) | null = null;

  return {
    // Initial state
    user: null,
    initializing: true,
    loading: false,
    currentLanguageProgress: null,
    selectedLanguage: null,

    // State setters
    setUser: (user) => set({ user }),
    setInitializing: (initializing) => set({ initializing }),
    setLoading: (loading) => set({ loading }),
    setSelectedLanguage: (languageCode) => {
      const currentSelected = get().selectedLanguage;

      if (
        currentSelected === languageCode &&
        get().currentLanguageProgress?.languageCode === languageCode &&
        get().currentLanguageProgress !== null
      ) {
        console.log("Language already selected, not updating.");
        return;
      }

      set({ selectedLanguage: languageCode });
      if (languageCode) {
        get().fetchUserLanguageProgress(languageCode);
      } else {
        get().clearLanguageProgressListener();
        set({ currentLanguageProgress: null });
      }
    },

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
        // Listener will set user to null
        return result;
      } catch (error: any) {
        return { success: false, error: error.message || "Sign out failed" };
      } finally {
        set({ loading: false });
      }
    },

    // Firestore operations
    updateUserXP: async (xpGained: number) => {
      console.log(`authStore.updateUserXP: Called with xpGained=${xpGained}`);
      const uid = get().user?.uid;
      const languageCode = get().selectedLanguage;

      if (!uid) {
        console.error("Cannot update XP: User not logged in.");
        return;
      }

      if (!languageCode) {
        console.error("Cannot update XP: Language not selected.");
        return;
      }

      if (xpGained <= 0) {
        console.log("No XP gained for language: ", languageCode);
        return;
      }

      console.log(
        `authStore.updateUserXP: Processing for uid=${uid}, lang=${languageCode}`
      );

      const progressColRef = collection(firestore, "userLanguageProgress");
      const q = query(
        progressColRef,
        where("userId", "==", uid),
        where("languageCode", "==", languageCode)
      );

      // No need to set loading here if the listener provides optimistic updates
      // or if UI handles loading state based on currentLanguageProgress being null initially

      try {
        // check if the user leveled up
        console.log(
          `authStore.updateUserXP: Attempting to get existing progress for ${languageCode}`
        );
        const querySnapshot = await getDocs(q);
        console.log(
          `authStore.updateUserXP: querySnapshot.empty=${querySnapshot.empty} for ${languageCode}`
        );

        let currentXP = 0;
        let currentLevel = 1;
        let docRef;
        let isNewDoc = false;

        if (querySnapshot.empty) {
          // If no document exists, create a new one
          docRef = doc(progressColRef);
          isNewDoc = true;
          console.log(
            `authStore.updateUserXP: No existing doc for ${languageCode}. currentXP=${currentXP}, currentLevel=${currentLevel}. New docRef ID: ${docRef.id}`
          );
        } else {
          // If document exists, get the reference
          const progressDoc = querySnapshot.docs[0];
          docRef = progressDoc.ref;
          currentXP = progressDoc.data().xp || 0;
          currentLevel = progressDoc.data().level || 1;
          console.log(
            `authStore.updateUserXP: Existing doc found for ${languageCode}. currentXP=${currentXP}, currentLevel=${currentLevel}. Doc ID: ${docRef.id}`
          );
        }

        console.log(
          `authStore.updateUserXP: Calling checkLevelUp with currentXP=${
            currentXP + xpGained
          }, currentLevel=${currentLevel} for ${languageCode}`
        );

        const { level: newLevel, xp: newXP } = checkLevelUp(
          currentXP + xpGained,
          currentLevel
        );
        console.log(
          `authStore.updateUserXP: checkLevelUp result for ${languageCode}: newXP=${newXP}, newLevel=${newLevel}`
        );

        const progressData = {
          userId: uid,
          languageCode: languageCode,
          xp: newXP,
          level: newLevel,
          lastUpdated: serverTimestamp(),
        };

        console.log(
          `authStore.updateUserXP: Progress data to write for ${languageCode}:`,
          progressData
        );

        if (isNewDoc) {
          console.log(
            `authStore.updateUserXP: Attempting setDoc for new document for ${languageCode}`
          );

          await setDoc(docRef, progressData);
          console.log(
            `Initial XP set for user ${uid}, language ${languageCode}. New XP: ${newXP}, New Level: ${newLevel}`
          );
        } else {
          console.log(
            `authStore.updateUserXP: Attempting updateDoc for existing document for ${languageCode}`
          );

          await updateDoc(docRef, progressData);
          console.log(
            `XP updated by ${xpGained} for user ${uid}, language ${languageCode}. New XP: ${newXP}, New Level: ${newLevel}`
          );
        }

        // The listener set up by fetchUserLanguageProgress will update currentLanguageProgress.
        // For immediate feedback, you could still set it here, but it might cause a quick double update.
        // set({ currentLanguageProgress: { xp: newXP, level: newLevel, languageCode }});
      } catch (error) {
        console.error(
          `Error updating XP for user ${uid}, language ${languageCode}:`,
          error
        );
        // Optionally try to refetch if listener failed?
      }
    },

    fetchUserLanguageProgress: async (languageCode) => {
      const uid = get().user?.uid;

      if (unsubscribeLanguageProgressListener) {
        unsubscribeLanguageProgressListener(); // Unsubscribe from the previous listener to fetch different language progress
        unsubscribeLanguageProgressListener = null;
      }

      if (!uid) {
        console.error("Cannot fetch language progress: User not logged in.");
        set({ currentLanguageProgress: null });
        return;
      }

      set({ loading: true }); // Indicate loading for initial fetch

      const progressColRef = collection(firestore, "userLanguageProgress");
      const q = query(
        progressColRef,
        where("userId", "==", uid),
        where("languageCode", "==", languageCode)
      );

      unsubscribeLanguageProgressListener = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          if (snapshot.empty) {
            set({
              currentLanguageProgress: {
                xp: 0,
                level: 1,
                languageCode: languageCode,
              },
              loading: false,
            });
          } else {
            const progressDocData = snapshot.docs[0].data();
            set({
              currentLanguageProgress: {
                xp: progressDocData.xp,
                level: progressDocData.level,
                languageCode: progressDocData.languageCode as LanguageCode,
              },
              loading: false,
            });
          }
        },
        (error) => {
          console.error(
            `Error listening to language progress for user ${uid}, language ${languageCode}:`,
            error
          );
          set({ currentLanguageProgress: null, loading: false });
        }
      );
    },

    clearLanguageProgressListener: () => {
      if (unsubscribeLanguageProgressListener) {
        unsubscribeLanguageProgressListener();
        unsubscribeLanguageProgressListener = null;
        console.log("Cleared language progress listener.");
      }
    },

    // Initialize the auth listener
    initializeAuthListener: () => {
      console.log("Initializing Auth Listener...");
      const unsubscribeAuth = auth.onAuthStateChanged(async (authUser) => {
        console.log("Auth State Changed:", authUser?.uid);

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

          if (get().initializing) set({ initializing: false });
        } else {
          // User is signed out
          console.log("User signed out.");
          set({
            user: null,
            currentLanguageProgress: null,
            initializing: false,
          });
        }
      });

      // Return a function that unsubscribes both listeners on cleanup
      return () => {
        console.log("Cleaning up auth and Firestore listeners.");
        unsubscribeAuth();
      };
    },
  };
});
