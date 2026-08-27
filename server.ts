import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to convert raw PCM to WAV buffer if needed
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  if (pcmBuffer.length > 12 && pcmBuffer.toString("ascii", 0, 4) === "RIFF") {
    return pcmBuffer;
  }

  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Linear PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// TTS Generation Endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore", style = "natural", customPrompt } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required for speech synthesis" });
    }

    const cleanText = text.trim();

    // Map style presets to expressive instructions
    const styleInstructions: Record<string, string> = {
      natural: "Say naturally and clearly in Greek with warm human cadence:",
      cheerful: "Say cheerfully, enthusiastically, and with a bright uplifting smile in Greek:",
      storyteller: "Say like an engaging, captivating storyteller with theatrical pacing and expressive pauses in Greek:",
      calm: "Say in a peaceful, gentle, soothing, and relaxing tone in Greek:",
      formal: "Say in a professional, authoritative, articulate Greek news broadcast tone:",
      dramatic: "Say with intense dramatic emotion, resonant weight, and vivid inflection in Greek:",
      poetic: "Say with deep lyrical emotion, soft melodic rhythm, and poetic sensitivity in Greek:",
      epic: "Say in a grand, legendary, classical ancient oratorical style in Greek:",
      whisper: "Say in a soft, intimate, gentle quiet whisper in Greek:",
      energetic: "Say with high energy, vibrant excitement, and dynamic rhythm in Greek:",
    };

    let promptText = cleanText;
    const instruction = customPrompt || styleInstructions[style] || styleInstructions.natural;
    promptText = `${instruction}\n"${cleanText}"`;

    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || "Kore",
            },
          },
        },
      },
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const rawAudioBase64 = candidatePart?.inlineData?.data;
    const returnedMime = candidatePart?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (!rawAudioBase64) {
      return res.status(500).json({
        error: "No audio data received from Gemini TTS model",
        details: response.text || "Empty speech response",
      });
    }

    // Extract sample rate if present in mimeType, default 24000
    let sampleRate = 24000;
    if (returnedMime.includes("rate=")) {
      const match = returnedMime.match(/rate=(\d+)/);
      if (match && match[1]) {
        sampleRate = parseInt(match[1], 10);
      }
    }

    const rawBuffer = Buffer.from(rawAudioBase64, "base64");
    const wavBuffer = pcmToWav(rawBuffer, sampleRate, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");
    const audioDataUrl = `data:audio/wav;base64,${wavBase64}`;

    res.json({
      success: true,
      audioUrl: audioDataUrl,
      format: "audio/wav",
      sampleRate,
      voiceName,
      style,
      textLength: cleanText.length,
    });
  } catch (error: any) {
    console.error("Error generating speech:", error);
    res.status(500).json({
      error: error.message || "Failed to generate speech audio",
      details: error.toString(),
    });
  }
});

// Translation / Enhancement helper if user wants AI to translate English/other to Greek first
app.post("/api/translate-to-greek", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Translate the following text into natural, fluent Greek (Ελληνικά) with proper monotonic accents (τόνους). Return ONLY the Greek translation without any explanations or quotation marks:\n\n${text}`,
    });

    const translated = response.text?.trim() || text;
    res.json({ success: true, greekText: translated });
  } catch (error: any) {
    console.error("Error translating to Greek:", error);
    res.status(500).json({ error: error.message || "Failed to translate" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Greek Text-to-Speech Server running on port ${PORT}`);
  });
}

startServer();
