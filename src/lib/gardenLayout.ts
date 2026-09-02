export interface SlotDefinition {
  id: string;
  xPct: number; // position within the garden canvas, percentage
  yPct: number;
  scale: number; // depth cue: slots further back are smaller
}

// Six stable slots per garden area, staggered like a real flower bed so
// bouquets don't line up in a grid. Percentages are relative to the canvas.
export const SLOTS_PER_AREA: SlotDefinition[] = [
  { id: "slot-1", xPct: 18, yPct: 66, scale: 1.05 },
  { id: "slot-2", xPct: 50, yPct: 78, scale: 1.15 },
  { id: "slot-3", xPct: 82, yPct: 64, scale: 1.05 },
  { id: "slot-4", xPct: 30, yPct: 40, scale: 0.85 },
  { id: "slot-5", xPct: 68, yPct: 38, scale: 0.85 },
  { id: "slot-6", xPct: 50, yPct: 22, scale: 0.7 },
];

export const SLOTS_PER_GARDEN_AREA = SLOTS_PER_AREA.length;

export const GARDEN_THEMES = ["spring", "meadow", "dawn"] as const;
export type GardenTheme = (typeof GARDEN_THEMES)[number];
