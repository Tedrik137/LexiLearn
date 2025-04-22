import { DecodedIdToken } from "firebase-admin/auth";
import { auth as adminAuth } from "./firebaseAdminConfig";

interface AuthResult {
  success: boolean;
  decodedToken?: DecodedIdToken;
  error?: string;
}

export async function verifyFirebaseToken(
  request: Request
): Promise<AuthResult> {
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
