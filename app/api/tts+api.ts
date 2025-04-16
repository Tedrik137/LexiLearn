// filepath: /home/devricky/git/react-native/LexiLearn/app/api/tts+api.ts
import admin from "firebase-admin"; // Import directly
import { verifyFirebaseToken } from "./utils/authMiddleware"; // Assuming middleware handles its own admin init

// --- One-time Initialization Logic for Storage ---
let adminStorageInstance: admin.storage.Storage | undefined = undefined;
function initializeAdminStorage(): admin.storage.Storage | undefined {
  if (admin.apps.length > 0 && admin.apps[0]) {
    // Prefer getting storage from the default app if it exists
    if (!adminStorageInstance) {
      adminStorageInstance = admin.apps[0].storage();
    }
    return adminStorageInstance;
  }

  // Initialize if not already done (or if default app doesn't exist)
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
      console.log("Initializing Firebase admin for TTS API...");
      // Use default app name if possible, or a unique one
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      }); // Default app name
      console.log("Firebase admin initialized successfully for TTS API.");
      adminStorageInstance = app.storage();
      return adminStorageInstance;
    } catch (error: any) {
      if (error.code === "app/duplicate-app") {
        console.log("Admin app for TTS API already exists, getting instance.");
        const existingApp = admin.app(); // Get default app
        adminStorageInstance = existingApp.storage();
        return adminStorageInstance;
      }
      console.error("Error initializing Firebase admin for TTS API:", error);
      return undefined;
    }
  }
  return undefined;
}
// --- End Initialization Logic ---

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY!;

export async function POST(request: Request) {
  // --- Authentication Middleware ---
  const authResult = await verifyFirebaseToken(request);
  if (!authResult.success) {
    return Response.json(
      { success: false, source: authResult.error },
      { status: 401 }
    );
  }

  const adminStorage = adminStorageInstance || initializeAdminStorage();
  if (!adminStorage) {
    return Response.json(
      { success: false, source: "Admin SDK not initialized" },
      { status: 500 }
    );
  }

  try {
    const { fileName, text, language } = await request.json();

    if (!fileName || !text || !language) {
      return Response.json(
        { success: false, source: "Missing required parameters" },
        { status: 400 }
      );
    }

    const bucket = adminStorage.bucket();
    const filePath = `tts/${fileName}`;
    const file = bucket.file(filePath);

    // Check if file exists in Firebase Storage
    const [exists] = await file.exists();

    if (exists) {
      try {
        // Get file contents directly (or a signed URL if preferred)
        const [fileBuffer] = await file.download();
        const base64 = fileBuffer.toString("base64");

        return Response.json({
          success: true,
          encodedMP3: base64,
          source: "firebase",
        });
      } catch (downloadError) {
        console.error(
          "Error downloading existing file from Firebase Storage:",
          downloadError
        );
        // Decide if you want to proceed to Google TTS or return error
      }
    }

    // File not in firebase or download failed, ask google cloud TTS API
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize`;

    const requestBody = {
      input: { text: text },
      voice: {
        languageCode: language,
        name: `${language}-Wavenet-D`,
        ssmlGender: "NEUTRAL",
      },
      audioConfig: { audioEncoding: "MP3" },
    };

    try {
      console.log(`Fetching TTS for "${text}"...`);
      const ttsResponse = await fetch(ttsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GOOGLE_TTS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await ttsResponse.json();

      if (!data.audioContent) {
        console.error("TTS API error: No audio content returned", data);
        // Consider returning a specific error response
        return Response.json(
          { success: false, source: "Google TTS failed" },
          { status: 502 }
        ); // Bad Gateway example
      }

      // Upload to Firebase Storage using Admin SDK
      const audioBuffer = Buffer.from(data.audioContent as string, "base64");
      await file.save(audioBuffer, {
        metadata: { contentType: "audio/mp3" },
      });
      console.log(`Uploaded TTS audio to ${filePath}`);

      return Response.json({
        success: true,
        encodedMP3: data.audioContent, // Already base64 from Google
        source: "google-tts",
      });
    } catch (error) {
      console.error("Error fetching or uploading TTS:", error);
      return Response.json(
        { success: false, source: "TTS processing error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in tts API:", error);
    return Response.json(
      {
        success: false,
        source: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
