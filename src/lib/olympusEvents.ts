/** Published only after successful placement persistence, never on selection/drag.
 * A short-lived snapshot bridges picker/edit unmount to the garden remount. */
export const OLYMPUS_PLACED = "garden:placement-saved";
let latest: { areaId: string; slotId: string; time: number } | null = null;
export const latestOlympusCelebration = () => latest;
export function notifyPlacementSaved(areaId: string, slotId: string) {
  latest = { areaId, slotId, time: Date.now() };
  window.dispatchEvent(new Event(OLYMPUS_PLACED));
}
