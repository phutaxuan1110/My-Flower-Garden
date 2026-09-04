// Vercel Serverless Function — runs on Node.js, never shipped to the browser.
// GROQ_API_KEY / GEMINI_API_KEY are only ever read here; the client never
// sees either.
//
// Strategy: try Groq first (fast, generous free tier). If Groq fails after
// retries (or its key isn't set), automatically fall back to Gemini if that
// key is configured. This does NOT guarantee success — both are external
// services that can go down — but it removes "one provider had a bad day"
// as a single point of failure.
//
// Env vars (Vercel Project Settings -> Environment Variables):
//   GROQ_API_KEY   — free, no card, https://console.groq.com/keys
//   GEMINI_API_KEY — optional fallback, https://aistudio.google.com/apikey

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_MODEL = "qwen/qwen3.6-27b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GEMINI_RESPONSE_SCHEMA = {
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

function buildPrompt(language: "vi" | "en", jsonInstructions: string): string {
  const lang = language === "vi" ? "Vietnamese" : "English";
  return (
    `You are a florist and botanist. Identify every distinct flower species visible in this bouquet photo. ` +
    `For each species, give: common name, scientific (Latin) name if known, dominant color, estimated stem count, ` +
    `confidence from 0 to 1, its traditional meaning, and up to 3 short symbolism keywords. ` +
    `Also give one warm overall sentence about what the whole bouquet expresses together. ` +
    `${jsonInstructions} ` +
    `Respond entirely in ${lang}. If you are not confident an item is a real flower/greenery, omit it rather than guessing wildly.`
  );
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

interface ProviderResult {
  ok: boolean;
  parsed?: unknown;
  /** Only set when ok is false — the raw provider+status for our own logs. */
  debugInfo?: string;
}

async function tryGroq(imageDataUrl: string, lang: "vi" | "en"): Promise<ProviderResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, debugInfo: "GROQ_API_KEY not set" };

  const requestBody = JSON.stringify({
    model: GROQ_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: buildPrompt(
              lang,
              `Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape: ` +
                `{"flowers":[{"commonName":string,"scientificName":string,"color":string,"estimatedQuantity":integer,"confidence":number,"meaning":string,"symbolism":[string]}],"overallMeaning":string}. Include at least one flower.`
            ),
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    temperature: 0.4,
    max_completion_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let r: Response;
    try {
      r = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: requestBody,
      });
    } catch (err) {
      console.error(`Groq network error (attempt ${attempt}/${maxAttempts})`, err);
      if (attempt === maxAttempts) return { ok: false, debugInfo: "Groq network error" };
      continue;
    }
    if (r.ok) {
      const data = await r.json();
      const text: string | undefined = data?.choices?.[0]?.message?.content;
      if (!text) return { ok: false, debugInfo: "Groq returned empty content" };
      try {
        return { ok: true, parsed: JSON.parse(text) };
      } catch {
        return { ok: false, debugInfo: "Groq returned invalid JSON" };
      }
    }
    const errText = await r.text().catch(() => "");
    console.error(`Groq API error ${r.status} (attempt ${attempt}/${maxAttempts})`, errText);
    const retryable = r.status === 503 || r.status === 429;
    if (!retryable || attempt === maxAttempts) {
      return { ok: false, debugInfo: `Groq ${r.status}: ${errText.slice(0, 300)}` };
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  return { ok: false, debugInfo: "Groq exhausted retries" };
}

async function tryGemini(imageDataUrl: string, lang: "vi" | "en"): Promise<ProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, debugInfo: "GEMINI_API_KEY not set" };

  const image = parseDataUrl(imageDataUrl);
  if (!image) return { ok: false, debugInfo: "invalid data URL" };

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          { text: buildPrompt(lang, "") },
          { inline_data: { mime_type: image.mimeType, data: image.base64 } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      thinkingConfig: { thinkingLevel: "low" },
    },
  });

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let r: Response;
    try {
      r = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: requestBody,
      });
    } catch (err) {
      console.error(`Gemini network error (attempt ${attempt}/${maxAttempts})`, err);
      if (attempt === maxAttempts) return { ok: false, debugInfo: "Gemini network error" };
      continue;
    }
    if (r.ok) {
      const data = await r.json();
      const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return { ok: false, debugInfo: "Gemini returned empty content" };
      try {
        return { ok: true, parsed: JSON.parse(text) };
      } catch {
        return { ok: false, debugInfo: "Gemini returned invalid JSON" };
      }
    }
    const errText = await r.text().catch(() => "");
    console.error(`Gemini API error ${r.status} (attempt ${attempt}/${maxAttempts})`, errText);
    const retryable = r.status === 503 || r.status === 429;
    if (!retryable || attempt === maxAttempts) {
      return { ok: false, debugInfo: `Gemini ${r.status}: ${errText.slice(0, 300)}` };
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  return { ok: false, debugInfo: "Gemini exhausted retries" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ status: "error", message: "Method not allowed" });
    return;
  }

  const { imageDataUrl, language } = (req.body ?? {}) as { imageDataUrl?: string; language?: string };
  const lang = language === "en" ? "en" : "vi";

  if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
    res.status(400).json({ status: "error", message: "imageDataUrl is required and must be a base64 data URL." });
    return;
  }

  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    res.status(500).json({ status: "error", message: "Server has no AI provider configured (GROQ_API_KEY / GEMINI_API_KEY)." });
    return;
  }

  try {
    const groqResult = await tryGroq(imageDataUrl, lang);
    if (groqResult.ok) {
      res.status(200).json({ status: "success", result: groqResult.parsed });
      return;
    }
    console.error("Groq failed, falling back to Gemini:", groqResult.debugInfo);

    const geminiResult = await tryGemini(imageDataUrl, lang);
    if (geminiResult.ok) {
      res.status(200).json({ status: "success", result: geminiResult.parsed });
      return;
    }
    console.error("Gemini fallback also failed:", geminiResult.debugInfo);

    res.status(502).json({
      status: "error",
      message:
        lang === "vi"
          ? "Dịch vụ nhận diện hoa đang quá tải. Vui lòng thử lại sau ít phút."
          : "The flower recognition service is busy right now. Please try again in a moment.",
    });
  } catch (error) {
    console.error("identify-flowers handler error", error);
    res.status(500).json({
      status: "error",
      message: lang === "vi" ? "Có lỗi xảy ra khi nhận diện hoa." : "Something went wrong identifying the flowers.",
    });
  }
}
