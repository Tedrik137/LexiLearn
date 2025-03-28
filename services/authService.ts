import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/firebaseConfig";

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

class AuthService {
  private auth = auth;

  async signUp(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      if (error instanceof FirebaseError) {
        return {
          success: false,
          error: this.mapFirebaseAuthError(error.code),
        };
      }
      return {
        success: false,
        error: `An unexpected error occurred: ${error}`,
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      if (error instanceof FirebaseError) {
        return {
          success: false,
          error: this.mapFirebaseAuthError(error.code),
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }

  async signOutUser(): Promise<AuthResult> {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to sign out",
      };
    }
  }

  private mapFirebaseAuthError(errorCode: string): string {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email is already registered";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password is too weak";
      case "auth/user-not-found":
        return "No user found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      default:
        return "Authentication error";
    }
  }
}

export default new AuthService();
