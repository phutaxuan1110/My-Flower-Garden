// Vercel Serverless Function — runs on Node.js, never shipped to the browser.
// This is the ONLY place GROQ_API_KEY is read; the client never sees it.
//
// Env var required (set in Vercel Project Settings -> Environment Variables,
// and in a local .env for `vercel dev`):
//   GROQ_API_KEY=your-key-from-console.groq.com/keys
//
// Groq is free (no credit card), fast, and has a generous daily limit
// (30 requests/min, 14,400/day as of writing). Model reference / to upgrade
// later: https://console.groq.com/docs/vision — Groq's vision-capable model
// lineup changes over time, so check that page if this model is retired.

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_MODEL = "qwen/qwen3.6-27b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildPrompt(language: "vi" | "en"): string {
  const lang = language === "vi" ? "Vietnamese" : "English";
  return (
    `You are a florist and botanist. Identify every distinct flower species visible in this bouquet photo. ` +
    `Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:\n` +
    `{\n` +
    `  "flowers": [\n` +
    `    {\n` +
    `      "commonName": string,\n` +
    `      "scientificName": string (Latin name, omit key if unknown),\n` +
    `      "color": string,\n` +
    `      "estimatedQuantity": integer (stem count visible),\n` +
    `      "confidence": number between 0 and 1,\n` +
    `      "meaning": string (its traditional meaning),\n` +
    `      "symbolism": array of up to 3 short keyword strings\n` +
    `    }\n` +
    `  ],\n` +
    `  "overallMeaning": string (one warm sentence about what the whole bouquet expresses together)\n` +
    `}\n` +
    `Include at least one flower. Respond entirely in ${lang}. ` +
    `If you are not confident an item is a real flower/greenery, omit it rather than guessing wildly.`
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ status: "error", message: "Server is missing GROQ_API_KEY." });
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
    const requestBody = JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildPrompt(lang) },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.4,
      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
    });

    // Groq occasionally returns 503 (overloaded) or 429 (rate limited) under
    // load — these are transient, so retry a couple of times with backoff.
    let groqRes: Response | null = null;
    let lastErrText = "";
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const r = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: requestBody,
      });
      if (r.ok) {
        groqRes = r;
        break;
      }
      lastErrText = await r.text().catch(() => "");
      const retryable = r.status === 503 || r.status === 429;
      console.error(`Groq API error ${r.status} (attempt ${attempt}/${maxAttempts})`, lastErrText);
      if (!retryable || attempt === maxAttempts) {
        groqRes = r;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }

    if (!groqRes || !groqRes.ok) {
      res.status(502).json({
        status: "error",
        message:
          lang === "vi"
            ? "Dịch vụ nhận diện hoa đang quá tải. Vui lòng thử lại sau ít phút."
            : "The flower recognition service is busy right now. Please try again in a moment.",
      });
      return;
    }

    const data = await groqRes.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
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
