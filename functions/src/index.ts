import * as functions from "firebase-functions/v1";
import { UserRecord } from "firebase-functions/v1/auth";
import * as logger from "firebase-functions/logger";
import { firestore, storage } from "./firebaseAdminConfig";
import { FieldValue } from "firebase-admin/firestore";
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
        xp: 0,
        currentStreak: 0,
        currentStreakStart: FieldValue.serverTimestamp(),
        level: 1,
      });
      logger.info(`Successfully initialized data for user: ${uid}`);
    } catch (error) {
      logger.error(`Error initializing data for user ${uid}:`, error);
    }
  });

// --- NEW: HTTP Callable Function for TTS ---
export const getOrCreateTTSAudio = functions
  .runWith({ secrets: ["GOOGLE_TTS_API_KEY"] })
  .https.onCall(async (data, context) => {
    // 1. Authentication Check: Ensure the user is authenticated.
    if (!context.auth) {
      logger.error("TTS request received without authentication.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    // Optional: Log the UID of the authenticated user making the request
    logger.info(
      `TTS request received from authenticated user: ${context.auth.uid}`
    );

    // 2. Input Validation
    const { fileName, text, language } = data;
    if (!fileName || !text || !language) {
      logger.error("TTS request missing required parameters:", data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: fileName, text, language."
      );
    }

    if (!process.env.GOOGLE_TTS_API_KEY) {
      logger.error(
        "Google TTS API Key is not configured in function environment variables."
      );
      throw new functions.https.HttpsError(
        "internal",
        "Server configuration error [TTS Key]."
      );
    }

    // 3. Logic from your original API route
    try {
      const bucket = storage.bucket(); // Use initialized storage
      const filePath = `tts/${fileName}`; // Define path in storage
      const file = bucket.file(filePath);

      // Check if file exists in Firebase Storage
      const [exists] = await file.exists();

      if (exists) {
        try {
          // Get file contents as base64
          const [fileBuffer] = await file.download();
          const base64 = fileBuffer.toString("base64");
          logger.info(
            `Returning cached TTS audio from Storage for: ${fileName}`
          );
          return { success: true, encodedMP3: base64, source: "firebase" };
        } catch (downloadError) {
          logger.error(
            `Error downloading existing file ${fileName} from Storage:`,
            downloadError
          );
          // Decide if you want to proceed to Google TTS or return error
          // For simplicity, we'll proceed, but you could throw an error here.
        }
      }

      // File not in firebase or download failed, ask google cloud TTS API
      logger.info(
        `File ${fileName} not found in cache, calling Google TTS API for text: "${text}"`
      );
      const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`;
      const ttsPayload = {
        input: { text: text },
        voice: { languageCode: language, ssmlGender: "MALE" }, // Adjust voice params as needed
        audioConfig: { audioEncoding: "MP3" },
      };

      const ttsResponse = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ttsPayload),
      });

      if (!ttsResponse.ok) {
        const errorBody = await ttsResponse.text();
        logger.error(
          `Google TTS API request failed with status ${ttsResponse.status}: ${errorBody}`
        );
        throw new functions.https.HttpsError(
          "internal", // Or map Google's error status if possible
          `Google TTS API failed: ${ttsResponse.statusText}`
        );
      }

      const ttsData = await ttsResponse.json();

      if (!ttsData.audioContent) {
        logger.error(
          "Google TTS API error: No audio content returned",
          ttsData
        );
        throw new functions.https.HttpsError(
          "internal",
          "Google TTS API returned no audio content."
        );
      }

      // Upload to Firebase Storage using Admin SDK
      const audioBuffer = Buffer.from(ttsData.audioContent as string, "base64");
      await file.save(audioBuffer, {
        metadata: { contentType: "audio/mp3" },
      });
      logger.info(`Uploaded TTS audio to ${filePath}`);

      // Return the newly generated audio
      return {
        success: true,
        encodedMP3: ttsData.audioContent, // Already base64 from Google
        source: "google-tts",
      };
    } catch (error: any) {
      logger.error(`Error processing TTS request for ${fileName}:`, error);
      // Throwing HttpsError allows the client SDK to catch it properly
      if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw specific HttpsErrors
      }
      // Throw a generic internal error for other cases
      throw new functions.https.HttpsError(
        "internal",
        error.message ||
          "An unexpected error occurred processing the TTS request."
      );
    }
  });
