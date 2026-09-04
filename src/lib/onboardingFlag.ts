// Whether this device has seen the onboarding slides. Intentionally a plain
// localStorage flag rather than part of GardenRepository: onboarding must be
// viewable before the user is authenticated, so it can't depend on Supabase.
const KEY = "mfg:onboardingSeen";
const listeners = new Set<() => void>();

export function getOnboardingSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setOnboardingSeen(value: boolean): void {
  try {
    if (value) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // ignore (e.g. Safari private mode quota)
  }
  for (const listener of listeners) listener();
}

/** For useSyncExternalStore, so components re-render on same-tab writes too. */
export function subscribeOnboardingSeen(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
