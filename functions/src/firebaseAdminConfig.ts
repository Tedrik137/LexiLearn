import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK if it hasn't been initialized already
if (admin.apps.length === 0) {
  admin.initializeApp();
  logger.info("Firebase Admin SDK Initialized");
}

// Export the admin instance for use in other modules
export const firebaseAdmin = admin;

// Export commonly used services for convenience
export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();
