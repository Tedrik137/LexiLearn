// app/api/tts+api.ts
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../../firebaseConfig";

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY!;

export async function POST(request: Request) {
  try {
    const { fileName, text, language } = await request.json();

    if (!fileName || !text || !language) {
      return Response.json(
        {
          success: false,
          source: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Path in Firebase Storage
    const filePath = `tts/${fileName}`;
    const fileRef = ref(storage, filePath);

    try {
      // Try to get file from Firebase Storage
      const downloadURL = await getDownloadURL(fileRef);

      // Download the file and convert to base64
      const response = await fetch(downloadURL);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      return Response.json({
        success: true,
        encodedMP3: base64,
        source: "firebase",
      });
    } catch (firebaseError) {
      // File not in firebase, ask google cloud TTS API
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
        const response = await fetch(ttsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GOOGLE_TTS_API_KEY,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (!data.audioContent) {
          console.error("TTS API error: No audio content returned");
          return;
        }

        // Upload to Firebase Storage
        const audioBuffer = Buffer.from(data.audioContent as string, "base64");
        await uploadBytes(fileRef, audioBuffer, {
          contentType: "audio/mp3",
        });

        return Response.json({
          success: true,
          encodedMP3: data.audioContent.toString("base64"),
          source: "google-tts",
        });
      } catch (error) {
        console.error("Error fetching TTS:", error);
      }
    }
  } catch (error) {
    console.error("Error in check-audio API:", error);
    return Response.json(
      {
        success: false,
        source: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
