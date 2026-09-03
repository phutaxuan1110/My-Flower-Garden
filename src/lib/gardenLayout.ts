export interface SlotDefinition {
  id: string;
  xPct: number; // position within the garden canvas, percentage
  yPct: number;
  scale: number; // depth cue: slots further back are smaller
}

// Six stable slots matching the round stone platforms drawn into the garden
// background artwork (my-flower-garden-empty.png). Coordinates were measured
// directly against that image (percentage of its width/height) so bouquet
// overlays land exactly on the platforms regardless of viewport width, as
// long as the canvas keeps the image's native aspect ratio (see
// GARDEN_IMAGE_ASPECT_RATIO below and GardenCanvas).
export const SLOTS_PER_AREA: SlotDefinition[] = [
  { id: "slot-1", xPct: 23.8, yPct: 66.0, scale: 1.05 },
  { id: "slot-2", xPct: 77.1, yPct: 73.2, scale: 1.1 },
  { id: "slot-3", xPct: 9.0, yPct: 56.5, scale: 1.0 },
  { id: "slot-4", xPct: 90.4, yPct: 55.1, scale: 1.0 },
  { id: "slot-5", xPct: 32.2, yPct: 41.3, scale: 0.85 },
  { id: "slot-6", xPct: 72.0, yPct: 49.4, scale: 0.9 },
];

export const SLOTS_PER_GARDEN_AREA = SLOTS_PER_AREA.length;

// Native pixel dimensions of my-flower-garden-empty.png. The canvas is kept
// at this exact aspect ratio (object-fit: contain would otherwise letterbox
// inconsistently across viewports and throw off the slot percentages).
export const GARDEN_IMAGE_ASPECT_RATIO = "572 / 1024";

export const GARDEN_THEMES = ["spring", "meadow", "dawn"] as const;
export type GardenTheme = (typeof GARDEN_THEMES)[number];
