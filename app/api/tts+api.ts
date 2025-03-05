const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY!;

export async function POST(request: Request) {
  const { text, language } = await request.json();

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

    return Response.json({ encodedMP3: data.audioContent });
  } catch (error) {
    console.error("Error fetching TTS:", error);
  }
}
