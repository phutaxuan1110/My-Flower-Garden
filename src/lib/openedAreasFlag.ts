// Tracks which garden areas the person has explicitly tapped "Mở khoá" on.
//
// The very first area (order 0) never needs this — it's always open. Every
// area after that is created automatically the moment the previous one is
// completed (see GardenProvider.materializeNextAreaIfNeeded), but should
// still render as a locked gate — not a normal, walk-right-in garden — until
// the person taps the unlock button and watches the water-reveal animation.
// That "has this specific area been opened" bit is purely a presentation
// concern (nothing about the underlying data changes), so it lives here as a
// plain per-device localStorage set rather than a database column.
import { useSyncExternalStore } from "react";

const KEY = "mfg:openedAreaIds";
const listeners = new Set<() => void>();

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Cached as a stable Set reference (only ever replaced, never mutated in
// place) so useSyncExternalStore's getSnapshot can return the same
// reference across renders when nothing changed — returning a brand-new Set
// object on every call would make React think the store changes on every
// render and loop forever.
let cachedIds = new Set(readFromStorage());

export function getOpenedAreaIds(): Set<string> {
  return cachedIds;
}

export function isAreaOpened(areaId: string): boolean {
  return cachedIds.has(areaId);
}

export function markAreaOpened(areaId: string): void {
  if (cachedIds.has(areaId)) return;
  cachedIds = new Set(cachedIds).add(areaId);
  try {
    localStorage.setItem(KEY, JSON.stringify([...cachedIds]));
  } catch {
    // ignore (e.g. Safari private mode quota)
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive read for components — re-renders on same-tab writes too. */
export function useOpenedAreaIds(): Set<string> {
  return useSyncExternalStore(subscribe, getOpenedAreaIds, getOpenedAreaIds);
}
