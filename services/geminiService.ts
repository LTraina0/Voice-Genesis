import { GoogleGenAI, Modality, Type } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

export interface TranscriptionResult {
  transcription: string;
  vocalStyle: string;
}

export const generateSpeech = async (text: string, voiceName: string, style: string): Promise<string> => {
  try {
    const prompt = `Using the following style instruction: "${style}", say this text: "${text}"`;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw new Error("Failed to generate speech via Gemini API.");
  }
};

export const transcribeAndAnalyzeAudio = async (audioBase64: string, mimeType: string): Promise<TranscriptionResult> => {
  try {
    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    };
    const textPart = {
      text: "Transcribe the audio. Also, analyze the speaker's vocal characteristics (such as pace, pitch, and tone) and provide a concise, one-sentence description of their vocal style. Do not add any conversational filler.",
    };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [audioPart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING, description: "The verbatim transcription of the audio." },
            vocalStyle: { type: Type.STRING, description: "A concise, one-sentence description of the speaker's vocal style, for example: 'a calm, measured tone with a medium pitch'." }
          },
          required: ["transcription", "vocalStyle"]
        }
      }
    });

    const jsonString = response.text;
    const result: TranscriptionResult = JSON.parse(jsonString);

    if (!result.transcription || !result.vocalStyle) {
      throw new Error("API did not return a valid transcription and vocal style.");
    }

    return result;
  } catch (error) {
    console.error("Error in transcribeAndAnalyzeAudio:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the transcription analysis from the API.");
    }
    throw new Error("Failed to transcribe and analyze audio via Gemini API.");
  }
};
