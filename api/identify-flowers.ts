// Vercel Serverless Function — runs on Node.js, never shipped to the browser.
// This is the ONLY place GEMINI_API_KEY is read; the client never sees it.
//
// Env var required (set in Vercel Project Settings -> Environment Variables,
// and in a local .env for `vercel dev`):
//   GEMINI_API_KEY=your-key-from-aistudio.google.com
//
// Model reference / to upgrade later: https://ai.google.dev/gemini-api/docs/models

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Mirrors AIRecognitionResultSchema in src/lib/aiService.ts. Gemini's
// "responseSchema" support forces the model to return exactly this shape, so
// we don't need a loose free-text parse on our side.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    flowers: {
      type: "ARRAY",
      minItems: 1,
      items: {
        type: "OBJECT",
        properties: {
          commonName: { type: "STRING" },
          scientificName: { type: "STRING" },
          color: { type: "STRING" },
          estimatedQuantity: { type: "INTEGER" },
          confidence: { type: "NUMBER", description: "0 to 1" },
          meaning: { type: "STRING" },
          symbolism: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["commonName", "confidence", "meaning"],
      },
    },
    overallMeaning: { type: "STRING" },
  },
  required: ["flowers", "overallMeaning"],
};

function buildPrompt(language: "vi" | "en"): string {
  const lang = language === "vi" ? "Vietnamese" : "English";
  return (
    `You are a florist and botanist. Identify every distinct flower species visible in this bouquet photo. ` +
    `For each species, give: common name, scientific (Latin) name if known, dominant color, estimated stem count in the photo, ` +
    `your confidence from 0 to 1, its traditional meaning, and up to 3 short symbolism keywords. ` +
    `Also give one warm overall sentence about what the whole bouquet expresses together. ` +
    `Respond entirely in ${lang}. If you are not confident an item is a real flower/greenery, omit it rather than guessing wildly.`
  );
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ status: "error", message: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ status: "error", message: "Server is missing GEMINI_API_KEY." });
    return;
  }

  const { imageDataUrl, language } = (req.body ?? {}) as { imageDataUrl?: string; language?: string };
  const lang = language === "en" ? "en" : "vi";

  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    res.status(400).json({ status: "error", message: "imageDataUrl is required." });
    return;
  }

  const image = parseDataUrl(imageDataUrl);
  if (!image) {
    res.status(400).json({ status: "error", message: "imageDataUrl must be a base64 data URL." });
    return;
  }

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt(lang) },
              { inline_data: { mime_type: image.mimeType, data: image.base64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      console.error("Gemini API error", geminiRes.status, errText);
      res.status(502).json({
        status: "error",
        message: lang === "vi" ? "Không thể kết nối dịch vụ nhận diện hoa." : "Couldn't reach the flower recognition service.",
      });
      return;
    }

    const data = await geminiRes.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({
        status: "error",
        message: lang === "vi" ? "Không nhận được kết quả từ mô hình AI." : "The AI model returned no result.",
      });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(502).json({
        status: "error",
        message: lang === "vi" ? "Kết quả AI không đúng định dạng." : "The AI result wasn't valid JSON.",
      });
      return;
    }

    // Final shape validation happens again on the client with the same Zod
    // schema, so a malformed field here surfaces as a normal "try again"
    // error in the UI rather than a crash.
    res.status(200).json({ status: "success", result: parsed });
  } catch (error) {
    console.error("identify-flowers handler error", error);
    res.status(500).json({
      status: "error",
      message: lang === "vi" ? "Có lỗi xảy ra khi nhận diện hoa." : "Something went wrong identifying the flowers.",
    });
  }
}
