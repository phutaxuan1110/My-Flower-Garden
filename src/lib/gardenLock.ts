// Sequential map/level unlock logic.
//
// The rule: a garden area is only ever created (see
// GardenProvider.ensureAreaWithFreeSlot / materializeNextAreaIfNeeded) once
// the area before it is completely full. That means every *real* GardenArea
// the app already knows about is, by construction, unlocked — there is
// nothing to check there.
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
 * Real areas (sorted) + at most one trailing locked preview for the area
 * that will be created next, if the current last area isn't full yet.
 */
export function buildDisplayAreas(areas: GardenArea[], placements: GardenPlacement[]): DisplayGardenArea[] {
  const sorted = [...areas].sort((a, b) => a.order - b.order);
  const result: DisplayGardenArea[] = sorted.map((area) => ({
    id: area.id,
    name: area.name,
    theme: area.theme,
    order: area.order,
    filledCount: countFilledSlots(area, placements),
    capacity: SLOTS_PER_GARDEN_AREA,
    isLocked: false, // real areas only ever exist after the one before them is full
    isVirtual: false,
  }));

  const last = sorted[sorted.length - 1];
  const lastIsFull = last ? isAreaFull(last, placements) : false;

  if (!last || !lastIsFull) {
    const nextOrder = last ? last.order + 1 : 0;
    result.push({
      id: `virtual-${nextOrder}`,
      name: generateAreaName(nextOrder),
      theme: themeForAreaOrder(nextOrder),
      order: nextOrder,
      filledCount: 0,
      capacity: SLOTS_PER_GARDEN_AREA,
      isLocked: Boolean(last), // area 0 (the very first) is never locked
      isVirtual: !last ? false : true,
    });
  }

  return result;
}
