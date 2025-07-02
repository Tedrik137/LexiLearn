import { getAuth } from "firebase-admin/auth";
import { firestore } from "./firebaseAdminConfig";
import { logger } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";
import { FieldValue } from "firebase-admin/firestore";

export const initializeLeaderboardData = functions.firestore
  .document("lessonHistory/{historyId}")
  .onCreate(async (snap, context) => {
    const lessonHistoryData = snap.data();

    const { userId } = lessonHistoryData;

    if (!userId) {
      logger.error("User ID is missing in the lesson history data.");
      return;
    }

    let displayName = "Unknown User";

    try {
      const userRecord = await getAuth().getUser(userId);
      if (userRecord.displayName) {
        displayName = userRecord.displayName;
      }
    } catch (error) {
      logger.error("Error fetching user data:", error);
    }

    const leaderboardRef = firestore.collection("leaderboard").doc(userId);
    const leaderboardDoc = await leaderboardRef.get();

    if (!leaderboardDoc.exists) {
      await leaderboardRef.set({
        userId: userId,
        displayName: displayName,
        weeklyScore: 1,
        monthlyScore: 1,
        allTimeScore: 1,
      });
      logger.info(`Leaderboard entry created for user: ${userId}`);
    } else {
      logger.info(`Leaderboard entry already exists for user: ${userId}`);

      await leaderboardRef.update({
        weeklyScore: FieldValue.increment(1),
        monthlyScore: FieldValue.increment(1),
        allTimeScore: FieldValue.increment(1),
      });
      logger.info(`Leaderboard entry updated for user: ${userId}`);
    }
  });

export const resetWeeklyLeaderboardScores = functions.pubsub
  .schedule("0 0 * * 0") // Every Sunday at midnight
  .timeZone("America/New_York") // Adjust to your timezone
  .onRun(async (context) => {
    const leaderboardRef = firestore.collection("leaderboard");
    const snapshot = await leaderboardRef.get();

    if (snapshot.empty) {
      logger.info("No leaderboard entries to reset.");
      return;
    }

    const batch = firestore.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        weeklyScore: 0,
      });
    });

    await batch.commit();
    logger.info("Weekly scores reset successfully.");
  });

export const resetMonthlyLeaderboardScores = functions.pubsub
  .schedule("0 0 1 * *") // First day of every month at midnight
  .timeZone("America/New_York") // Adjust to your timezone
  .onRun(async (context) => {
    const leaderboardRef = firestore.collection("leaderboard");
    const snapshot = await leaderboardRef.get();

    if (snapshot.empty) {
      logger.info("No leaderboard entries to reset.");
      return;
    }

    const batch = firestore.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        monthlyScore: 0,
      });
    });

    await batch.commit();
    logger.info("Monthly scores reset successfully.");
  });
