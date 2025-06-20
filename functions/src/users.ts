import { UserRecord } from "firebase-functions/v1/auth";
import { firestore } from "./firebaseAdminConfig";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";

// --- Auth Trigger (Keep this as is) ---
export const initializeUserData = functions.auth
  .user()
  .onCreate(async (user: UserRecord) => {
    const { uid } = user;
    const userRef = firestore.collection("users").doc(uid);

    logger.info(`Initializing data for new user: ${uid}`);

    try {
      await userRef.set({
        uid: uid,
        displayName: user.displayName || "",
        createdAt: FieldValue.serverTimestamp(),
        currentStreak: 0,
        currentStreakStart: FieldValue.serverTimestamp(),
      });

      const goalsRef = firestore.collection("userGoals");
      const batch = firestore.batch();
      const languages = ["English", "Arabic", "French", "Japanese"];

      languages.forEach((language) => {
        const goalsDoc = goalsRef.doc();

        batch.set(goalsDoc, {
          uid: uid,
          key: language,
          goals: [],
        });
      });

      await batch.commit();

      logger.info(`Successfully initialized data for user: ${uid}`);
    } catch (error) {
      logger.error(`Error initializing data for user ${uid}:`, error);
    }
  });
