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
  /**
   * True when the area already exists (isVirtual === false) and every area
   * before it is full, but the person hasn't tapped the unlock gate yet —
   * i.e. it's real and reachable, just still waiting for the explicit
   * "Mở khoá" tap + water-reveal animation before it becomes an open,
   * interactive garden.
   */
  isReadyToUnlock: boolean;
}

export function countFilledSlots(area: Pick<GardenArea, "id">, placements: GardenPlacement[]): number {
  return new Set(placements.filter((p) => p.gardenAreaId === area.id).map((p) => p.slotId)).size;
}

export function isAreaFull(area: Pick<GardenArea, "id">, placements: GardenPlacement[]): boolean {
  return countFilledSlots(area, placements) >= SLOTS_PER_GARDEN_AREA;
}

/**
 * Consecutively unlocked real areas (sorted) + at most one trailing entry:
 * either a "ready to unlock" gate (the next area already exists but hasn't
 * been manually opened yet) or, if it doesn't exist yet, a locked preview.
 *
 * `openedAreaIds` holds the ids of areas the person has explicitly tapped
 * "Mở khoá" on (see openedAreasFlag.ts) — the very first area (order 0)
 * never needs this, it's always open.
 */
export function buildDisplayAreas(
  areas: GardenArea[],
  placements: GardenPlacement[],
  openedAreaIds: ReadonlySet<string> = new Set()
): DisplayGardenArea[] {
  const isOpened = (area: GardenArea) => area.order === 0 || openedAreaIds.has(area.id);

  const sorted = [...areas].sort((a, b) => a.order - b.order);
  const unlocked: GardenArea[] = [];

  // Only expose the consecutive part of the progression that the user has
  // actually unlocked. Older versions could create the next database row
  // early (or turn a duplicated seed row into the next order), which made two
  // unlocked copies of the same garden appear side by side. A real row is not
  // enough to make an area visible: every preceding area must also be full,
  // and (beyond the very first) the person must have manually opened it.
  for (const area of sorted) {
    const previous = unlocked[unlocked.length - 1];
    if (previous && !isAreaFull(previous, placements)) break;
    if (!isOpened(area)) break;
    unlocked.push(area);
  }

  const result: DisplayGardenArea[] = unlocked.map((area) => ({
    id: area.id,
    // Areas 1 and 2 always show their fixed names ("Hera's Sacred Garden",
    // "Castalian Spring") regardless of what's stored — accounts created
    // before these names existed still have the old stored value (e.g.
    // "Garden Corner"), so the first two are always recomputed the same way
    // the theme is, rather than trusted from storage.
    name: area.order <= 1 ? generateAreaName(area.order) : area.name,
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
    isReadyToUnlock: false,
  }));

  const last = unlocked[unlocked.length - 1];

  // Always compute exactly one trailing entry representing "what's next" —
  // previously this was skipped whenever `last` was already full, on the
  // assumption that a real next area would already be sitting in `unlocked`
  // by then. That assumption broke the moment manual-unlock gating was
  // added above: the loop now deliberately stops *before* pushing an
  // unopened next area into `unlocked`, so when the last included area is
  // full, the trailing slot is exactly what should render the "ready to
  // unlock" gate — skipping it here made the just-completed area's unlock
  // gate never appear at all (only fixing itself once something else, like
  // deleting a bouquet, forced a recompute where `last` briefly wasn't full).
  {
    const nextOrder = last ? last.order + 1 : 0;
    const existingNext = sorted.find((area) => area.order === nextOrder);
    result.push({
      id: existingNext?.id ?? `virtual-${nextOrder}`,
      name: generateAreaName(nextOrder),
      theme: themeForAreaOrder(nextOrder),
      order: nextOrder,
      filledCount: 0,
      capacity: SLOTS_PER_GARDEN_AREA,
      isLocked: Boolean(last), // area 0 (the very first) is never locked
      isVirtual: !existingNext,
      // Real row already exists (created the moment the previous area was
      // completed) and every area before it is full — it's just waiting on
      // the person to tap the unlock gate.
      isReadyToUnlock: Boolean(existingNext) && Boolean(last),
    });
  }

  return result;
}
