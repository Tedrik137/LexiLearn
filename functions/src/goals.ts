import * as functions from "firebase-functions/v1";
import { logger } from "firebase-functions/v1";
import { firestore } from "./firebaseAdminConfig";
import { v4 as uuidv4 } from "uuid";

interface GoalItem {
  id: string;
  text: string;
  checked: boolean;
}

interface UserGoalsDocument {
  uid: string;
  key: string;
  goals: GoalItem[];
}

export const getGoals = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.error("Get goals request received without authentication.");
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const uid = context.auth.uid;

  logger.info(`Get goals request received from user: ${uid}`);

  try {
    const goalsCollection = firestore.collection("userGoals");

    const query = goalsCollection.where("uid", "==", uid);

    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      logger.info(`No goals found for user: ${uid}`);
      return [];
    }

    const goals = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    console.log(goals);

    logger.info(`Successfully fetched ${goals.length} goals for user: ${uid}`);

    return goals;
  } catch (error) {
    logger.error(`Error fetching goals for user ${uid}:`, error);
    throw new functions.https.HttpsError("internal", "Failed to fetch goals.");
  }
});

export const deleteGoal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.error("Delete goal request received without authentication.");
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const uid = context.auth.uid;
  const languageKey = data.language as string; // Sent from frontend
  const goalIdToDelete = data.id as string; // Sent from frontend

  if (!languageKey || !goalIdToDelete) {
    logger.error("Missing languageKey or goalId in deleteGoal request.", {
      uid,
      data,
    });
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with 'language' and 'id' parameters."
    );
  }

  logger.info(
    `Delete goal request for user: ${uid}, language: ${languageKey}, goalId: ${goalIdToDelete}`
  );

  try {
    const userGoalsCollection = firestore.collection("userGoals");
    // Find the document for the specific user.
    // This assumes 'uid' is a field in your documents within 'userGoals' collection.
    const userDocumentQuery = userGoalsCollection
      .where("uid", "==", uid)
      .where("key", "==", languageKey);

    const querySnapshot = await userDocumentQuery.get();
    const userDocRef = querySnapshot.docs[0].ref;
    const userDocSnap = await userDocRef.get(); // Get latest document snapshot
    const userDocData = userDocSnap.data() as UserGoalsDocument | undefined;

    if (!userDocData || !Array.isArray(userDocData.goals)) {
      logger.error(
        `Invalid data structure in document ${userDocRef.id} for user ${uid}.`
      );
      throw new functions.https.HttpsError(
        "internal",
        "Invalid user goals data structure."
      );
    }

    let goalWasRemoved = false;

    const updatedLanguageGoalsArray: GoalItem[] = userDocData.goals.filter(
      (goal: GoalItem) => {
        if (goal.id === goalIdToDelete) {
          goalWasRemoved = true; // Mark that a goal was removed
        }
        return goal.id !== goalIdToDelete; // Filter out the goal to delete
      }
    );

    // Update the document with the modified array
    await userDocRef.update({
      goals: updatedLanguageGoalsArray,
    });

    if (goalWasRemoved) {
      logger.info(
        `Successfully deleted goal ${goalIdToDelete} for language ${languageKey}, user ${uid}.`
      );
    } else {
      logger.info(
        `Goal ${goalIdToDelete} for language ${languageKey}, user ${uid} not found or already deleted. Document structure updated/maintained.`
      );
    }

    return { success: true, message: "Goal deletion processed." };
  } catch (error: any) {
    logger.error(`Error deleting goal for user ${uid}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete goal.",
      error.message
    );
  }
});

export const addGoal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    logger.error("Add goal request received without authentication.");
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  const uid = context.auth.uid;
  const languageKey = data.language as string; // Sent from frontend
  const goalText = data.text as string; // Sent from frontend

  if (!languageKey || !goalText) {
    logger.error("Missing languageKey or goalText in addGoal request.", {
      uid,
      data,
    });
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with 'language' and 'text' parameters."
    );
  }

  logger.info(
    `Add goal request for user: ${uid}, language: ${languageKey}, goalText: ${goalText}`
  );

  try {
    const userGoalsCollection = firestore.collection("userGoals");
    // Find the document for the specific user.
    const userDocumentQuery = userGoalsCollection
      .where("uid", "==", uid)
      .where("key", "==", languageKey);

    const querySnapshot = await userDocumentQuery.get();
    const userDocRef = querySnapshot.docs[0].ref;
    const userDocSnap = await userDocRef.get();
    const userDocData = userDocSnap.data() as UserGoalsDocument | undefined;

    if (!userDocData || !Array.isArray(userDocData.goals)) {
      logger.error(
        `Invalid data structure in document ${userDocRef.id} for user ${uid}.`
      );
      throw new functions.https.HttpsError(
        "internal",
        "Invalid user goals data structure."
      );
    }
    const newGoal: GoalItem = {
      id: uuidv4(), // Generate a unique ID for the new goal
      text: goalText,
      checked: false,
    };

    const updatedLanguageGoalsArray: GoalItem[] = [
      ...userDocData.goals,
      newGoal,
    ];

    // Update the document with the modified array
    await userDocRef.update({
      goals: updatedLanguageGoalsArray,
    });

    logger.info(
      `Successfully added goal ${goalText} for language ${languageKey}, user ${uid}.`
    );

    return newGoal;
  } catch (error: any) {
    logger.error(`Error adding goal for user ${uid}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to add goal.",
      error.message
    );
  }
});

export const updateGoalCheckedStatus = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      logger.error("updateGoalCheckedStatus request without authentication.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const uid = context.auth.uid;
    const { languageKey, goalId, checked } = data;

    if (!languageKey || !goalId || checked === undefined) {
      logger.error("Invalid arguments for updateGoalCheckedStatus.", {
        uid,
        data,
      });
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid parameters (languageKey, goalId, checked)."
      );
    }

    logger.info(
      `Updating goal status for user: ${uid}, lang: ${languageKey}, goal: ${goalId}, checked: ${checked}`
    );

    try {
      const userGoalsCollection = firestore.collection("userGoals");
      const userLanguageDocQuery = userGoalsCollection
        .where("uid", "==", uid)
        .where("key", "==", languageKey);

      const querySnapshot = await userLanguageDocQuery.get();

      if (querySnapshot.empty) {
        logger.error(
          `No document found for user ${uid} and language ${languageKey}.`
        );
        // Depending on desired behavior, you might create it or throw an error
        throw new functions.https.HttpsError(
          "not-found",
          "Goal document for the language not found."
        );
      }

      const userLanguageDocRef = querySnapshot.docs[0].ref;
      const userLanguageDocSnap = await userLanguageDocRef.get();
      const userDocData = userLanguageDocSnap.data();

      if (!userDocData || !Array.isArray(userDocData.goals)) {
        logger.error(
          `Invalid data structure for user ${uid}, lang ${languageKey}.`
        );
        throw new functions.https.HttpsError(
          "internal",
          "Invalid goal data structure."
        );
      }

      const updatedGoals = userDocData.goals.map((goal: GoalItem) => {
        if (goal.id === goalId) {
          return { ...goal, checked: checked };
        }
        return goal;
      });

      await userLanguageDocRef.update({ goals: updatedGoals });

      logger.info(
        `Successfully updated goal ${goalId} status for user ${uid}, lang ${languageKey}.`
      );
      return { success: true, message: "Goal status updated." };
    } catch (error: any) {
      logger.error(`Error updating goal status for user ${uid}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update goal status.",
        error.message
      );
    }
  }
);
