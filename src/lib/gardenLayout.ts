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
export const SLOTS_GARDEN: SlotDefinition[] = [
  { id: "slot-1", xPct: 23.8, yPct: 66.0, scale: 1.05 },
  { id: "slot-2", xPct: 77.1, yPct: 73.2, scale: 1.1 },
  { id: "slot-3", xPct: 9.0, yPct: 56.5, scale: 1.0 },
  { id: "slot-4", xPct: 90.4, yPct: 55.1, scale: 1.0 },
  { id: "slot-5", xPct: 32.2, yPct: 41.3, scale: 0.85 },
  { id: "slot-6", xPct: 72.0, yPct: 49.4, scale: 0.9 },
];

// Six floating stepping-stone slots matching my-flower-garden-river.png,
// measured the same way (percentage of that image's width/height) against
// the six stone platforms drawn zig-zagging down the river.
export const SLOTS_RIVER: SlotDefinition[] = [
  { id: "slot-1", xPct: 34.3, yPct: 26.8, scale: 0.85 },
  { id: "slot-2", xPct: 70.7, yPct: 33.3, scale: 0.92 },
  { id: "slot-3", xPct: 30.5, yPct: 45.3, scale: 0.98 },
  { id: "slot-4", xPct: 71.7, yPct: 55.1, scale: 1.02 },
  { id: "slot-5", xPct: 30.5, yPct: 68.6, scale: 1.08 },
  { id: "slot-6", xPct: 71.8, yPct: 80.5, scale: 1.12 },
];

// Kept for older call sites that only knew about a single layout — points at
// the original garden layout so behavior is unchanged for area 1.
export const SLOTS_PER_AREA: SlotDefinition[] = SLOTS_GARDEN;

export const SLOTS_PER_GARDEN_AREA = SLOTS_GARDEN.length;

// Native pixel dimensions of my-flower-garden-empty.png. The canvas is kept
// at this exact aspect ratio (object-fit: contain would otherwise letterbox
// inconsistently across viewports and throw off the slot percentages).
export const GARDEN_IMAGE_ASPECT_RATIO = "572 / 1024";

// Every map/level art shares this same aspect ratio (my-flower-garden-river.png
// was cropped to match it) so the canvas never needs to resize between areas.
export const GARDEN_THEMES = ["garden", "river"] as const;
export type GardenTheme = (typeof GARDEN_THEMES)[number];

export function slotsForTheme(theme: string): SlotDefinition[] {
  return theme === "river" ? SLOTS_RIVER : SLOTS_GARDEN;
}

// Deterministic theme (and therefore backdrop art) for a given area order —
// 0-based, matching GardenArea.order. Alternates between the two available
// backdrops so consecutive maps look visually distinct.
export function themeForAreaOrder(order: number): GardenTheme {
  return order % 2 === 0 ? "garden" : "river";
}
