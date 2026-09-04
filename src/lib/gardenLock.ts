// Sequential map/level unlock logic.
//
// The rule: a garden area is unlocked only after the area before it is
// completely full. Current code creates areas at that boundary, but display
// logic still enforces the rule because older data may contain an area that
// was seeded early or duplicated.
//
// The one thing that doesn't exist yet in the data is the "next" area while
// the current last area is still being filled — but the user should always
// be able to see (a locked preview of) it. This file derives that preview
// without writing anything to storage, using the exact same deterministic
// naming/theme rules that will apply once the area is actually created, so
// the preview never has to change.
import { generateAreaName } from "./gardenNaming";
import { SLOTS_PER_GARDEN_AREA, themeForAreaOrder } from "./gardenLayout";
import type { GardenArea, GardenPlacement } from "../types";
export interface DisplayGardenArea {
  id: string;
  name: string;
  theme: string;
  order: number;
  filledCount: number;
  capacity: number;
  isLocked: boolean;
  /** True for the synthesized "next" preview that doesn't exist in storage yet. */
  isVirtual: boolean;
}

export function countFilledSlots(area: Pick<GardenArea, "id">, placements: GardenPlacement[]): number {
  return new Set(placements.filter((p) => p.gardenAreaId === area.id).map((p) => p.slotId)).size;
}

export function isAreaFull(area: Pick<GardenArea, "id">, placements: GardenPlacement[]): boolean {
  return countFilledSlots(area, placements) >= SLOTS_PER_GARDEN_AREA;
}

/**
 * Consecutively unlocked real areas (sorted) + at most one trailing locked
 * preview while the current last unlocked area is not full.
 */
export function buildDisplayAreas(areas: GardenArea[], placements: GardenPlacement[]): DisplayGardenArea[] {
  const sorted = [...areas].sort((a, b) => a.order - b.order);
  const unlocked: GardenArea[] = [];

  // Only expose the consecutive part of the progression that the user has
  // actually unlocked. Older versions could create the next database row
  // early (or turn a duplicated seed row into the next order), which made two
  // unlocked copies of the same garden appear side by side. A real row is not
  // enough to make an area visible: every preceding area must also be full.
  for (const area of sorted) {
    const previous = unlocked[unlocked.length - 1];
    if (previous && !isAreaFull(previous, placements)) break;
    unlocked.push(area);
  }

  const result: DisplayGardenArea[] = unlocked.map((area) => ({
    id: area.id,
    name: area.name,
    // Deterministic from `order`, not the stored `theme` column: areas
    // created before the alternating garden/river scheme existed can have
    // a stale value (e.g. old default "spring") saved in the database,
    // which made every area render the same garden artwork instead of
    // alternating. Order is the single source of truth for which backdrop
    // an area shows, so it's recomputed here every time rather than
    // trusted from storage.
    theme: themeForAreaOrder(area.order),
    order: area.order,
    filledCount: countFilledSlots(area, placements),
    capacity: SLOTS_PER_GARDEN_AREA,
    isLocked: false,
    isVirtual: false,
  }));

  const last = unlocked[unlocked.length - 1];
  const lastIsFull = last ? isAreaFull(last, placements) : false;

  if (!last || !lastIsFull) {
    const nextOrder = last ? last.order + 1 : 0;
    const existingNext = sorted.find((area) => area.order === nextOrder);
    result.push({
      id: existingNext?.id ?? `virtual-${nextOrder}`,
      name: existingNext?.name ?? generateAreaName(nextOrder),
      theme: themeForAreaOrder(nextOrder),
      order: nextOrder,
      filledCount: 0,
      capacity: SLOTS_PER_GARDEN_AREA,
      isLocked: Boolean(last), // area 0 (the very first) is never locked
      isVirtual: !existingNext,
    });
  }

  return result;
}
