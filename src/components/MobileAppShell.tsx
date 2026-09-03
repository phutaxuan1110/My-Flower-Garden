import React from "react";
import { BottomNavigation } from "./BottomNavigation";
import { useGardenEditMode } from "../hooks/useGardenEditMode";

/**
 * Root layout shell.
 *
 * Root cause of the "bottom nav hidden/cut off on iPhone" bug: the shell
 * previously sized itself with `min-h-screen` (a *minimum* based on `100vh`).
 * `100vh` on iOS Safari is measured against the *largest* possible viewport
 * (address bar + toolbar collapsed), so when Safari's chrome is visible the
 * true visible area is shorter than `100vh`. Because the shell only had a
 * *minimum* height (not a cap), the inner scrollable content div had no
 * definite parent height to clip against, so the whole page could grow
 * taller than the visible viewport and push `BottomNavigation` (anchored
 * `absolute bottom-0` inside that shell) below the fold or under Safari's
 * toolbar.
 *
 * Fix: give the shell a *definite* height using the dynamic viewport unit
 * (`h-dvh`, with a `vh` fallback via the `.sheet-fill-height`-style pattern
 * baked into Tailwind's `dvh` utilities) so it always matches the actually
 * visible viewport and updates live as Safari's chrome shows/hides. The
 * inner content area then truly clips/scrolls within that fixed-height
 * shell, and the nav — pinned to the shell's bottom edge — stays exactly at
 * the visible bottom of the screen, including its safe-area inset.
 */
export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const { isActive: isGardenEditActive } = useGardenEditMode();

  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] md:h-auto md:min-h-dvh md:overflow-visible md:flex md:items-center md:justify-center md:py-10">
      <div className="paper-grain relative mx-auto flex h-full w-full max-w-[480px] flex-col bg-[var(--color-bg)] md:h-auto md:min-h-[880px] md:rounded-[36px] md:shadow-2xl md:shadow-[var(--color-rose)]/15 md:ring-1 md:ring-[var(--color-line)]">
        <div
          className={`no-scrollbar flex-1 overflow-y-auto ${isGardenEditActive ? "" : "app-content-padding"}`}
        >
          {children}
        </div>
        {!isGardenEditActive && <BottomNavigation />}
      </div>
    </div>
  );
}
