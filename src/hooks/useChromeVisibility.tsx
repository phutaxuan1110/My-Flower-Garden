import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * Registry of "reasons" the bottom navigation should be hidden. Several
 * things can independently want it hidden at once (a modal opening while
 * another is mid-exit-animation, for example), so this tracks a *set* of
 * reason keys rather than a single boolean — nav only comes back once every
 * requester has released its reason.
 *
 * Root cause this exists to fix: individual overlays (BouquetQuickView,
 * AddBouquetSheet, GardenUnlockCelebration, ConfirmationDialog) each relied
 * on being painted with a higher z-index than BottomNavigation to visually
 * sit above it. In practice their content could still end up obscured by
 * the nav (see the "quick view"/"add new" bug report) — a single mistaken
 * z-index anywhere, a stacking-context quirk, or new overlay content later
 * added without matching the exact right z-index is enough to break that.
 * Actually removing the nav from the DOM while an overlay needing the full
 * screen is open is the only guarantee that nothing in that overlay can
 * ever be covered, so every full-screen or bottom-anchored overlay in the
 * app registers itself here instead of just trusting z-index.
 */
interface ChromeVisibilityContextValue {
  isChromeHidden: boolean;
  hideChromeFor: (key: string) => void;
  showChromeFor: (key: string) => void;
}

const ChromeVisibilityContext = createContext<ChromeVisibilityContextValue | null>(null);

export function ChromeVisibilityProvider({ children }: { children: ReactNode }) {
  const [reasons, setReasons] = useState<Set<string>>(new Set());

  const hideChromeFor = useCallback((key: string) => {
    setReasons((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const showChromeFor = useCallback((key: string) => {
    setReasons((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const value = useMemo<ChromeVisibilityContextValue>(
    () => ({ isChromeHidden: reasons.size > 0, hideChromeFor, showChromeFor }),
    [reasons, hideChromeFor, showChromeFor]
  );

  return <ChromeVisibilityContext.Provider value={value}>{children}</ChromeVisibilityContext.Provider>;
}

export function useChromeVisibility(): ChromeVisibilityContextValue {
  const ctx = useContext(ChromeVisibilityContext);
  if (!ctx) throw new Error("useChromeVisibility must be used within ChromeVisibilityProvider");
  return ctx;
}

/**
 * Registers `key` as a reason to hide the bottom nav for as long as
 * `active` is true, and always releases it on unmount (so a component that
 * unmounts mid-open, e.g. via a route change, can never leave the nav
 * stuck hidden).
 */
export function useHideChromeWhen(active: boolean, key: string): void {
  const { hideChromeFor, showChromeFor } = useChromeVisibility();
  useEffect(() => {
    if (!active) return;
    hideChromeFor(key);
    return () => showChromeFor(key);
  }, [active, key, hideChromeFor, showChromeFor]);
}
