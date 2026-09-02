import { z } from "zod";
import type { AIRecognitionOutcome, AIRecognitionResult } from "../types";

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
 *          AIRecognitionResultSchema below
 *        - validates the response with that schema before returning it
 *   3. Point `RealFlowerAIService.endpoint` at that route and swap the
 *      export at the bottom of this file.
 */
export interface FlowerAIService {
  analyze(imageDataUrl: string, opts?: { timeoutMs?: number }): Promise<AIRecognitionOutcome>;
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

interface FlowerKnowledge {
  commonName: string;
  scientificName: string;
  colors: string[];
  meaning: string;
  symbolism: string[];
}

const FLOWER_LIBRARY: FlowerKnowledge[] = [
  {
    commonName: "Garden Rose",
    scientificName: "Rosa",
    colors: ["Pink", "Red", "White", "Peach"],
    meaning: "Grace, admiration and gentle affection",
    symbolism: ["Love", "Gratitude"],
  },
  {
    commonName: "Peony",
    scientificName: "Paeonia lactiflora",
    colors: ["Blush Pink", "Coral", "White"],
    meaning: "Romance, prosperity and a happy marriage",
    symbolism: ["Romance", "Good Fortune"],
  },
  {
    commonName: "Eucalyptus",
    scientificName: "Eucalyptus cinerea",
    colors: ["Silvery Green"],
    meaning: "Protection and renewal",
    symbolism: ["Renewal"],
  },
  {
    commonName: "Ranunculus",
    scientificName: "Ranunculus asiaticus",
    colors: ["Butter Yellow", "Coral", "White"],
    meaning: "You are radiant and full of charm",
    symbolism: ["Charm", "Joy"],
  },
  {
    commonName: "Baby's Breath",
    scientificName: "Gypsophila paniculata",
    colors: ["White"],
    meaning: "Everlasting love and pure intentions",
    symbolism: ["Everlasting Love"],
  },
  {
    commonName: "Tulip",
    scientificName: "Tulipa",
    colors: ["Red", "Pink", "Yellow"],
    meaning: "Perfect and deep love",
    symbolism: ["Love", "New Beginning"],
  },
  {
    commonName: "Lavender",
    scientificName: "Lavandula angustifolia",
    colors: ["Lilac Purple"],
    meaning: "Calm, devotion and quiet grace",
    symbolism: ["Devotion", "Calm"],
  },
  {
    commonName: "Sunflower",
    scientificName: "Helianthus annuus",
    colors: ["Golden Yellow"],
    meaning: "Warmth, loyalty and lasting happiness",
    symbolism: ["Joy", "Loyalty"],
  },
  {
    commonName: "Anemone",
    scientificName: "Anemone coronaria",
    colors: ["White", "Deep Red", "Purple"],
    meaning: "Anticipation and a love that endures",
    symbolism: ["Anticipation"],
  },
  {
    commonName: "Lisianthus",
    scientificName: "Eustoma grandiflorum",
    colors: ["Cream", "Lavender", "Pink"],
    meaning: "Appreciation and heartfelt gratitude",
    symbolism: ["Gratitude"],
  },
  {
    commonName: "Chrysanthemum",
    scientificName: "Chrysanthemum morifolium",
    colors: ["White", "Yellow", "Rust"],
    meaning: "Joy, honesty and long friendship",
    symbolism: ["Joy", "Friendship"],
  },
  {
    commonName: "Daisy",
    scientificName: "Bellis perennis",
    colors: ["White", "Yellow"],
    meaning: "Innocence, new beginnings and simple joy",
    symbolism: ["New Beginning"],
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
function generateMockResult(imageDataUrl: string): AIRecognitionResult {
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
      commonName: base.commonName,
      scientificName: base.scientificName,
      color: seededPick(base.colors, seed, i),
      estimatedQuantity: 3 + ((seed + i * 7) % 8),
      confidence: Math.round(confidence * 100) / 100,
      meaning: base.meaning,
      symbolism: base.symbolism,
    });
  }

  const overallMeaning = `A bouquet that speaks of ${flowers
    .map((f) => f.symbolism?.[0]?.toLowerCase() ?? f.meaning.toLowerCase())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3)
    .join(", ")}.`;

  return { flowers, overallMeaning };
}

export class MockFlowerAIService implements FlowerAIService {
  /** Set to a value in [0, 1) to force a failure rate; used by tests/demo. */
  public failureRate = 0.12;

  async analyze(
    imageDataUrl: string,
    opts?: { timeoutMs?: number }
  ): Promise<AIRecognitionOutcome> {
    const timeoutMs = opts?.timeoutMs ?? 20000;
    const work = new Promise<AIRecognitionOutcome>((resolve) => {
      const delay = 1400 + Math.random() * 1200;
      setTimeout(() => {
        const seed = hashString(imageDataUrl.slice(0, 200));
        const shouldFail = (seed % 100) / 100 < this.failureRate;
        if (shouldFail) {
          resolve({
            status: "error",
            message:
              "We couldn't identify the flowers in this photo. The connection may be unstable, or the image may be unclear.",
          });
          return;
        }
        const raw = generateMockResult(imageDataUrl);
        const parsed = AIRecognitionResultSchema.safeParse(raw);
        if (!parsed.success) {
          resolve({ status: "error", message: "The recognition result was invalid. Please try again." });
          return;
        }
        resolve({ status: "success", result: parsed.data });
      }, delay);
    });

    const timeout = new Promise<AIRecognitionOutcome>((resolve) => {
      setTimeout(
        () => resolve({ status: "error", message: "This is taking longer than expected. Please try again." }),
        timeoutMs
      );
    });

    return Promise.race([work, timeout]);
  }
}

// Swap this export for a RealFlowerAIService(`/api/ai/identify-flowers`) once
// a server route and provider credentials exist.
export const flowerAIService: FlowerAIService = new MockFlowerAIService();
