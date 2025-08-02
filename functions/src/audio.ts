import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import { storage } from "./firebaseAdminConfig";
import { SpeechClient } from "@google-cloud/speech";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export const getOrCreateTTSAudio = functions.https.onCall(
  async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
      logger.error("TTS request received without authentication.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    logger.info(
      `TTS request received from authenticated user: ${context.auth.uid}`
    );

    // 2. Input Validation
    const { fileName, text, language, gender } = data;
    if (!fileName || !text || !language) {
      logger.error("TTS request missing required parameters:", data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters: fileName, text, language."
      );
    }

    try {
      const bucket = storage.bucket();
      const filePath = `tts/${fileName}`;
      const file = bucket.file(filePath);

      // 3. Check if file exists in Firebase Storage (Cache)
      const [exists] = await file.exists();

      if (exists) {
        logger.info(`Returning cached TTS audio from Storage for: ${fileName}`);
        const [fileBuffer] = await file.download();
        return {
          success: true,
          encodedMP3: fileBuffer.toString("base64"),
          source: "firebase-cache",
        };
      }

      // 4. File not in cache, call Google Cloud TTS API via Client Library
      logger.info(
        `File ${fileName} not in cache, calling Google TTS API for text: "${text}"`
      );

      // Initialize the client. It uses service account credentials automatically.
      const ttsClient = new TextToSpeechClient();

      const request = {
        input: { text: text },
        voice: { languageCode: language, ssmlGender: gender },
        audioConfig: { audioEncoding: "MP3" as const }, // Use 'as const' for type safety
      };

      const [ttsResponse] = await ttsClient.synthesizeSpeech(request);

      if (!ttsResponse.audioContent) {
        logger.error("Google TTS API error: No audio content returned.");
        throw new functions.https.HttpsError(
          "internal",
          "Google TTS API returned no audio content."
        );
      }

      // 5. Upload the newly generated audio to Firebase Storage for caching
      // The audioContent is a Uint8Array, which can be saved directly.
      await file.save(ttsResponse.audioContent, {
        metadata: { contentType: "audio/mp3" },
      });
      logger.info(`Uploaded new TTS audio to ${filePath}`);

      // 6. Return the newly generated audio as a base64 string
      const encodedMP3 = Buffer.from(ttsResponse.audioContent).toString(
        "base64"
      );

      return {
        success: true,
        encodedMP3: encodedMP3,
        source: "google-tts",
      };
    } catch (error: any) {
      logger.error(`Error processing TTS request for ${fileName}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        error.message ||
          "An unexpected error occurred processing the TTS request."
      );
    }
  }
);

// --- REFACTORED Speech-to-Text Function ---
export const analyzeSpeech = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    logger.error("STT request received without authentication.");
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  logger.info(
    `SST request received from authenticated user: ${context.auth.uid}`
  );

  // 2. Input Validation
  const { audioUri, recognitionConfig } = data;
  if (!audioUri || !recognitionConfig) {
    logger.error("STT request missing required parameters:", data);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required parameters: audioUri and recognitionConfig."
    );
  }

  // Validate that the URI is a Google Cloud Storage URI
  if (!audioUri.startsWith("gs://")) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The audioUri must be a valid Google Cloud Storage URI (e.g., gs://bucket-name/file-path)."
    );
  }

  try {
    // 3. Initialize the Google Cloud Speech Client
    // The client automatically uses the function's service account for auth.
    const speechClient = new SpeechClient();

    // 4. Construct the request
    // The client library can read directly from the GCS URI, which is highly efficient.
    const audio = {
      uri: audioUri,
    };

    const request = {
      audio: audio,
      config: recognitionConfig, // Use the config passed from the client
    };

    logger.info("Sending request to Speech-to-Text API with config:", request);

    // 5. Call the API and process the response
    const [response] = await speechClient.recognize(request);
    const transcription =
      response.results
        ?.map((result) => result.alternatives?.[0].transcript)
        .join("\n") || "";

    logger.info(`Transcription successful for ${audioUri}: "${transcription}"`);

    return {
      success: true,
      transcription: transcription,
    };
  } catch (error: any) {
    logger.error(`Error processing STT request for ${audioUri}`, error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "An unexpected error occurred during speech analysis."
    );
  }
});
