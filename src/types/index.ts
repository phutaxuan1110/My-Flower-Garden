// Core domain types for My Flower Garden.
// Mirrors the data model spec: Bouquet, BouquetFlower, GardenArea, GardenPlacement.

export type Occasion =
  | "Birthday"
  | "Anniversary"
  | "Graduation"
  | "Thank You"
  | "Just Because"
  | "Custom";

export type DetectionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "manual";

export interface UserProfile {
  id: string;
  displayName: string;
  gardenName: string;
  createdAt: string;
  updatedAt: string;
}

export interface BouquetFlower {
  id: string;
  bouquetId: string;
  commonName: string;
  scientificName?: string;
  color?: string;
  estimatedQuantity?: number;
  confidence?: number; // 0..1, only meaningful when source === "ai"
  meaning: string;
  symbolism?: string[];
  source: "ai" | "user";
}

export interface Bouquet {
  id: string;
  userId: string;
  name: string;
  imageUrl: string; // data URL for this demo; would be a storage URL in production
  imageStoragePath?: string;
  receivedDate: string; // ISO date
  occasion?: Occasion;
  customOccasion?: string;
  giftedBy?: string;
  personalNote?: string;
  overallMeaning?: string;
  isFavorite: boolean;
  detectionStatus: DetectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GardenArea {
  id: string;
  userId: string;
  name: string;
  order: number;
  theme: string;
}

export interface GardenPlacement {
  id: string;
  gardenAreaId: string;
  bouquetId: string;
  slotId: string;
  vaseStyle?: VaseStyle;
  decorationStyle?: DecorationStyle;
  createdAt: string;
  updatedAt: string;
}

export type VaseStyle = "clay-pot" | "glass-vase" | "woven-basket" | "tin-bucket";
export type DecorationStyle = "none" | "sparkle" | "butterflies" | "fairy-lights" | "ribbon";

// ---- AI service contract ----

export interface DetectedFlower {
  id: string;
  commonName: string;
  scientificName?: string;
  color?: string;
  estimatedQuantity?: number;
  confidence: number;
  meaning: string;
  symbolism?: string[];
}

export interface AIRecognitionResult {
  flowers: DetectedFlower[];
  overallMeaning: string;
}

export type AIRecognitionOutcome =
  | { status: "success"; result: AIRecognitionResult }
  | { status: "error"; message: string };

// ---- View helpers ----

export interface BouquetWithFlowers extends Bouquet {
  flowers: BouquetFlower[];
  placement?: GardenPlacement;
}

export const OCCASIONS: Occasion[] = [
  "Birthday",
  "Anniversary",
  "Graduation",
  "Thank You",
  "Just Because",
  "Custom",
];

export const VASE_STYLES: { id: VaseStyle; label: string }[] = [
  { id: "clay-pot", label: "Clay pot" },
  { id: "glass-vase", label: "Glass vase" },
  { id: "woven-basket", label: "Woven basket" },
  { id: "tin-bucket", label: "Tin bucket" },
];

export const DECORATION_STYLES: { id: DecorationStyle; label: string }[] = [
  { id: "none", label: "None" },
  { id: "sparkle", label: "Sparkle" },
  { id: "butterflies", label: "Butterflies" },
  { id: "fairy-lights", label: "Fairy lights" },
  { id: "ribbon", label: "Ribbon" },
];
