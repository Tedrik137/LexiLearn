import type { DecodedIdToken } from "firebase-admin/auth";

// filepath: /home/devricky/git/react-native/LexiLearn/app/api/utils/authMiddleware.ts
import admin from "firebase-admin"; // Import directly

// --- One-time Initialization Logic ---
let adminAuthInstance: admin.auth.Auth | undefined = undefined;

function initializeAdminAuth(): admin.auth.Auth | undefined {
  if (admin.apps.length > 0 && admin.apps[0]) {
    // Already initialized, get auth from existing app
    if (!adminAuthInstance) {
      adminAuthInstance = admin.apps[0].auth();
    }
    return adminAuthInstance;
  }

  // Initialize if not already done
  const serviceAccountKeyBase64 =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;
  let serviceAccount: admin.ServiceAccount | undefined;
  // ... (parsing logic for serviceAccountKeyBase64 as before) ...
  if (serviceAccountKeyBase64) {
    try {
      const serviceAccountJson = Buffer.from(
        serviceAccountKeyBase64,
        "base64"
      ).toString("utf-8");
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error("Failed to parse service account key:", e);
      return undefined;
    }
  } else {
    console.warn("Service account key env var not set.");
    return undefined;
  }

  if (serviceAccount) {
    try {
      console.log("Initializing Firebase admin for Auth Middleware...");
      const app = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
          // storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, // Not needed for auth only
        },
        "adminAuthMiddlewareApp"
      ); // Give a unique name if initializing multiple times across files
      console.log(
        "Firebase admin initialized successfully for Auth Middleware."
      );
      adminAuthInstance = app.auth();
      return adminAuthInstance;
    } catch (error: any) {
      // Handle already exists error specifically if using unique names isn't feasible
      if (error.code === "app/duplicate-app") {
        console.log(
          "Admin app for Auth Middleware already exists, getting instance."
        );
        const existingApp = admin.app("adminAuthMiddlewareApp");
        adminAuthInstance = existingApp.auth();
        return adminAuthInstance;
      }
      console.error(
        "Error initializing Firebase admin for Auth Middleware:",
        error
      );
      return undefined;
    }
  }
  return undefined;
}
// --- End Initialization Logic ---

interface AuthResult {
  success: boolean;
  decodedToken?: DecodedIdToken;
  error?: string;
}

export async function verifyFirebaseToken(
  request: Request
): Promise<AuthResult> {
  const adminAuth = adminAuthInstance || initializeAdminAuth();

  if (!adminAuth) {
    console.error("Admin Auth SDK not initialized for verification.");
    return { success: false, error: "Auth service unavailable" };
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Missing or invalid Authorization header" };
  }

  const idToken = authorization.split("Bearer ")[1];
  if (!idToken) {
    return { success: false, error: "Missing token" };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { success: true, decodedToken: decodedToken };
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    const message = error instanceof Error ? error.message : "Invalid token";
    return { success: false, error: `Token verification failed: ${message}` };
  }
}
