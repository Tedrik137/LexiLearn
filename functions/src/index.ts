import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger"; // Import v2 logger

// Initialize the Admin SDK within the Cloud Functions environment
// This needs to run in the Cloud Functions runtime, separate from your Expo API routes
if (admin.apps.length === 0) {
  admin.initializeApp();
  logger.info("Firebase Admin SDK Initialized in Cloud Function");
}
// Triggered when a new Firebase user is created
export const initializeUserData = functions.auth
  .user()
  .onCreate(async (user) => {
    const { uid } = user;
    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);

    functions.logger.info(`Initializing data for new user: ${uid}`);

    try {
      await userRef.set({
        uid: uid, // Store uid in the document as well if needed
        email: user.email, // Store email if needed (optional)
        displayName: user.displayName || "", // Store display name if available
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Record creation time
        xp: 0,
        currentStreak: 0,
        // Add any other default fields for a new user
      });
      functions.logger.info(`Successfully initialized data for user: ${uid}`);
    } catch (error) {
      functions.logger.error(`Error initializing data for user ${uid}:`, error);
    }
  });
