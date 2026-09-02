import { z } from "zod";
import type { AIRecognitionOutcome, AIRecognitionResult } from "../types";
import type { Language } from "../i18n/translations";

/**
 * FlowerAIService is the seam between the UI and whichever vision provider
 * does the real recognition. Swap MockFlowerAIService for a real
 * implementation without touching any component.
 *
 * PRODUCTION SETUP (not wired up in this demo):
 *   1. Never call a vision provider with an API key from the browser.
 *   2. Add a server route, e.g. POST /api/ai/identify-flowers, that:
 *        - accepts a Supabase Storage path (not a base64 blob) for the photo
 *        - loads server-side credentials from process.env.FLOWER_AI_API_KEY
 *        - calls the provider (e.g. Anthropic/OpenAI vision, Google Vision,
 *          PlantNet) with a JSON-schema-constrained prompt matching
 *          AIRecognitionResultSchema below, asking it to respond in the
 *          requested language
 *        - validates the response with that schema before returning it
 *   3. Point `RealFlowerAIService.endpoint` at that route and swap the
 *      export at the bottom of this file.
 */
export interface FlowerAIService {
  analyze(
    imageDataUrl: string,
    opts?: { timeoutMs?: number; language?: Language }
  ): Promise<AIRecognitionOutcome>;
}

export const DetectedFlowerSchema = z.object({
  id: z.string().min(1),
  commonName: z.string().min(1),
  scientificName: z.string().optional(),
  color: z.string().optional(),
  estimatedQuantity: z.number().int().positive().optional(),
  confidence: z.number().min(0).max(1),
  meaning: z.string().min(1),
  symbolism: z.array(z.string()).optional(),
});

export const AIRecognitionResultSchema = z.object({
  flowers: z.array(DetectedFlowerSchema).min(1),
  overallMeaning: z.string().min(1),
});

// ---- Demo/mock adapter -----------------------------------------------------
// Clearly isolated from any production logic. Simulates provider latency and
// an occasional failure so the failure/retry UX is real, not decorative.
// Content is bilingual (vi/en) so the mock behaves like a provider that was
// asked to respond in the user's chosen language.

interface Localized {
  vi: string;
  en: string;
}

interface FlowerKnowledge {
  commonName: Localized;
  scientificName: string;
  colors: Localized[];
  meaning: Localized;
  symbolism: Localized[];
}

const FLOWER_LIBRARY: FlowerKnowledge[] = [
  {
    commonName: { vi: "Hoa hồng vườn", en: "Garden Rose" },
    scientificName: "Rosa",
    colors: [
      { vi: "Hồng", en: "Pink" },
      { vi: "Đỏ", en: "Red" },
      { vi: "Trắng", en: "White" },
      { vi: "Cam đào", en: "Peach" },
    ],
    meaning: { vi: "Sự duyên dáng, ngưỡng mộ và tình cảm dịu dàng", en: "Grace, admiration and gentle affection" },
    symbolism: [
      { vi: "Tình yêu", en: "Love" },
      { vi: "Biết ơn", en: "Gratitude" },
    ],
  },
  {
    commonName: { vi: "Mẫu đơn", en: "Peony" },
    scientificName: "Paeonia lactiflora",
    colors: [
      { vi: "Hồng phấn", en: "Blush Pink" },
      { vi: "San hô", en: "Coral" },
      { vi: "Trắng", en: "White" },
    ],
    meaning: { vi: "Sự lãng mạn, thịnh vượng và hôn nhân hạnh phúc", en: "Romance, prosperity and a happy marriage" },
    symbolism: [
      { vi: "Lãng mạn", en: "Romance" },
      { vi: "May mắn", en: "Good Fortune" },
    ],
  },
  {
    commonName: { vi: "Bạch đàn", en: "Eucalyptus" },
    scientificName: "Eucalyptus cinerea",
    colors: [{ vi: "Xanh bạc", en: "Silvery Green" }],
    meaning: { vi: "Sự bảo vệ và đổi mới", en: "Protection and renewal" },
    symbolism: [{ vi: "Đổi mới", en: "Renewal" }],
  },
  {
    commonName: { vi: "Mao lương", en: "Ranunculus" },
    scientificName: "Ranunculus asiaticus",
    colors: [
      { vi: "Vàng bơ", en: "Butter Yellow" },
      { vi: "San hô", en: "Coral" },
      { vi: "Trắng", en: "White" },
    ],
    meaning: { vi: "Bạn thật rạng rỡ và đầy cuốn hút", en: "You are radiant and full of charm" },
    symbolism: [
      { vi: "Duyên dáng", en: "Charm" },
      { vi: "Niềm vui", en: "Joy" },
    ],
  },
  {
    commonName: { vi: "Hoa baby", en: "Baby's Breath" },
    scientificName: "Gypsophila paniculata",
    colors: [{ vi: "Trắng", en: "White" }],
    meaning: { vi: "Tình yêu vĩnh cửu và tấm lòng chân thành", en: "Everlasting love and pure intentions" },
    symbolism: [{ vi: "Tình yêu vĩnh cửu", en: "Everlasting Love" }],
  },
  {
    commonName: { vi: "Tulip", en: "Tulip" },
    scientificName: "Tulipa",
    colors: [
      { vi: "Đỏ", en: "Red" },
      { vi: "Hồng", en: "Pink" },
      { vi: "Vàng", en: "Yellow" },
    ],
    meaning: { vi: "Tình yêu hoàn hảo và sâu sắc", en: "Perfect and deep love" },
    symbolism: [
      { vi: "Tình yêu", en: "Love" },
      { vi: "Khởi đầu mới", en: "New Beginning" },
    ],
  },
  {
    commonName: { vi: "Oải hương", en: "Lavender" },
    scientificName: "Lavandula angustifolia",
    colors: [{ vi: "Tím nhạt", en: "Lilac Purple" }],
    meaning: { vi: "Sự bình yên, tận tụy và duyên dáng lặng lẽ", en: "Calm, devotion and quiet grace" },
    symbolism: [
      { vi: "Tận tụy", en: "Devotion" },
      { vi: "Bình yên", en: "Calm" },
    ],
  },
  {
    commonName: { vi: "Hướng dương", en: "Sunflower" },
    scientificName: "Helianthus annuus",
    colors: [{ vi: "Vàng rực", en: "Golden Yellow" }],
    meaning: { vi: "Sự ấm áp, trung thành và hạnh phúc lâu dài", en: "Warmth, loyalty and lasting happiness" },
    symbolism: [
      { vi: "Niềm vui", en: "Joy" },
      { vi: "Trung thành", en: "Loyalty" },
    ],
  },
  {
    commonName: { vi: "Hải quỳ", en: "Anemone" },
    scientificName: "Anemone coronaria",
    colors: [
      { vi: "Trắng", en: "White" },
      { vi: "Đỏ đậm", en: "Deep Red" },
      { vi: "Tím", en: "Purple" },
    ],
    meaning: { vi: "Sự mong chờ và một tình yêu bền lâu", en: "Anticipation and a love that endures" },
    symbolism: [{ vi: "Mong chờ", en: "Anticipation" }],
  },
  {
    commonName: { vi: "Cát tường", en: "Lisianthus" },
    scientificName: "Eustoma grandiflorum",
    colors: [
      { vi: "Kem", en: "Cream" },
      { vi: "Oải hương", en: "Lavender" },
      { vi: "Hồng", en: "Pink" },
    ],
    meaning: { vi: "Sự trân trọng và lòng biết ơn chân thành", en: "Appreciation and heartfelt gratitude" },
    symbolism: [{ vi: "Biết ơn", en: "Gratitude" }],
  },
  {
    commonName: { vi: "Cúc họa mi lớn", en: "Chrysanthemum" },
    scientificName: "Chrysanthemum morifolium",
    colors: [
      { vi: "Trắng", en: "White" },
      { vi: "Vàng", en: "Yellow" },
      { vi: "Nâu gỉ", en: "Rust" },
    ],
    meaning: { vi: "Niềm vui, sự chân thành và tình bạn lâu dài", en: "Joy, honesty and long friendship" },
    symbolism: [
      { vi: "Niềm vui", en: "Joy" },
      { vi: "Tình bạn", en: "Friendship" },
    ],
  },
  {
    commonName: { vi: "Cúc dại", en: "Daisy" },
    scientificName: "Bellis perennis",
    colors: [
      { vi: "Trắng", en: "White" },
      { vi: "Vàng", en: "Yellow" },
    ],
    meaning: { vi: "Sự ngây thơ, khởi đầu mới và niềm vui giản dị", en: "Innocence, new beginnings and simple joy" },
    symbolism: [{ vi: "Khởi đầu mới", en: "New Beginning" }],
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 37) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededPick<T>(arr: T[], seed: number, offset: number): T {
  return arr[(seed + offset * 17) % arr.length];
}

/** Deterministic-ish demo recognition so repeated analysis of the same photo feels stable. */
function generateMockResult(imageDataUrl: string, language: Language): AIRecognitionResult {
  const seed = hashString(imageDataUrl.slice(0, 4000) + imageDataUrl.length);
  const flowerCount = 2 + (seed % 3); // 2-4 flowers
  const usedIndexes = new Set<number>();
  const flowers = [];

  for (let i = 0; i < flowerCount; i++) {
    let idx = (seed + i * 53) % FLOWER_LIBRARY.length;
    let guard = 0;
    while (usedIndexes.has(idx) && guard < FLOWER_LIBRARY.length) {
      idx = (idx + 1) % FLOWER_LIBRARY.length;
      guard++;
    }
    usedIndexes.add(idx);
    const base = FLOWER_LIBRARY[idx];
    const confidence = 0.55 + ((seed + i * 91) % 45) / 100; // 0.55 - 0.99
    flowers.push({
      id: `${idx}-${i}-${seed}`,
      commonName: base.commonName[language],
      scientificName: base.scientificName,
      color: seededPick(base.colors, seed, i)[language],
      estimatedQuantity: 3 + ((seed + i * 7) % 8),
      confidence: Math.round(confidence * 100) / 100,
      meaning: base.meaning[language],
      symbolism: base.symbolism.map((s) => s[language]),
    });
  }

  const joiner = language === "vi" ? ", " : ", ";
  const summaryParts = flowers
    .map((f) => f.symbolism?.[0]?.toLowerCase() ?? f.meaning.toLowerCase())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);

  const overallMeaning =
    language === "vi"
      ? `Một bó hoa nói lên ${summaryParts.join(joiner)}.`
      : `A bouquet that speaks of ${summaryParts.join(joiner)}.`;

  return { flowers, overallMeaning };
}

export class MockFlowerAIService implements FlowerAIService {
  /** Set to a value in [0, 1) to force a failure rate; used by tests/demo. */
  public failureRate = 0.12;

  async analyze(
    imageDataUrl: string,
    opts?: { timeoutMs?: number; language?: Language }
  ): Promise<AIRecognitionOutcome> {
    const timeoutMs = opts?.timeoutMs ?? 20000;
    const language = opts?.language ?? "vi";
    const failMessage =
      language === "vi"
        ? "Chúng tôi không thể nhận diện các loài hoa trong ảnh này. Có thể do kết nối không ổn định hoặc ảnh chưa rõ nét."
        : "We couldn't identify the flowers in this photo. The connection may be unstable, or the image may be unclear.";
    const invalidMessage =
      language === "vi"
        ? "Kết quả nhận diện không hợp lệ. Vui lòng thử lại."
        : "The recognition result was invalid. Please try again.";
    const timeoutMessage =
      language === "vi"
        ? "Việc này đang mất nhiều thời gian hơn dự kiến. Vui lòng thử lại."
        : "This is taking longer than expected. Please try again.";

    const work = new Promise<AIRecognitionOutcome>((resolve) => {
      const delay = 1400 + Math.random() * 1200;
      setTimeout(() => {
        const seed = hashString(imageDataUrl.slice(0, 200));
        const shouldFail = (seed % 100) / 100 < this.failureRate;
        if (shouldFail) {
          resolve({ status: "error", message: failMessage });
          return;
        }
        const raw = generateMockResult(imageDataUrl, language);
        const parsed = AIRecognitionResultSchema.safeParse(raw);
        if (!parsed.success) {
          resolve({ status: "error", message: invalidMessage });
          return;
        }
        resolve({ status: "success", result: parsed.data });
      }, delay);
    });

    const timeout = new Promise<AIRecognitionOutcome>((resolve) => {
      setTimeout(() => resolve({ status: "error", message: timeoutMessage }), timeoutMs);
    });

    return Promise.race([work, timeout]);
  }
}

// Swap this export for a RealFlowerAIService(`/api/ai/identify-flowers`) once
// a server route and provider credentials exist.
export const flowerAIService: FlowerAIService = new MockFlowerAIService();
