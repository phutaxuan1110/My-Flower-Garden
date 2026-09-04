import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useGardenEditMode } from "../hooks/useGardenEditMode";
import { useChromeVisibility } from "../hooks/useChromeVisibility";

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
 * Fix: let `position: fixed; inset: 0; height: auto` resolve the shell's
 * height from both physical viewport edges. Do not combine `inset: 0` with
 * `100dvh`: iOS standalone mode can report a dvh that is shorter by a safe
 * area, and an explicit height makes CSS ignore the bottom inset. The inner
 * content area then clips/scrolls inside the stretched shell while the nav
 * occupies its own row at the true bottom edge.
 *
 * Root cause of the "bottom nav flashes for a frame when opening Garden Edit
 * Mode" bug: whether Edit Mode is active lived *only* in React state
 * (`useGardenEditMode`), and that state was only set inside a `useEffect` in
 * `GardenPage` that reacts to the `/garden?editBouquet=<id>` deep link. On
 * the very first render after navigating to that URL, the effect hasn't run
 * yet, so `isActive` is still `false` and this shell renders the normal
 * `BottomNavigation` for one frame before the effect flips the flag and a
 * second render hides it.
 *
 * Fix: also derive "should hide chrome" directly and synchronously from the
 * URL's `editBouquet` search param (the only thing that ever triggers Edit
 * Mode — see `GardenPage`), not just from the context flag that lags one
 * render behind it. Because `useSearchParams` reflects the URL on the very
 * first render (no effect needed), this is correct from the first paint —
 * there is nothing to flash.
 * The nav is a non-scrolling flex item inside the same definite-height app
 * frame as the content. Only the content pane scrolls. This avoids mixing a
 * fixed element's visual-viewport coordinates with the shell's dynamic
 * layout viewport, which could leave the nav floating above the real bottom
 * on iOS and in tall responsive previews. `hideChrome` still removes it when
 * a full-screen overlay or Garden Edit Mode is active.
 */
export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const { isActive: isGardenEditActive } = useGardenEditMode();
  const { isChromeHidden } = useChromeVisibility();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isEnteringGardenEdit = searchParams.has("editBouquet");
  const isBouquetDetail = /^\/bouquet\/[^/]+\/?$/.test(pathname);
  const hideChrome = isGardenEditActive || isEnteringGardenEdit || isBouquetDetail || isChromeHidden;

  return (
    <div className="fixed inset-0 h-auto min-h-0 w-full overflow-hidden bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] md:static md:inset-auto md:min-h-dvh md:w-auto md:overflow-visible md:flex md:items-center md:justify-center md:py-10">
      <div className="paper-grain relative mx-auto flex h-full w-full max-w-[480px] flex-col bg-[var(--color-bg)] md:h-auto md:min-h-[880px] md:rounded-[36px] md:shadow-2xl md:shadow-[var(--color-rose)]/15 md:ring-1 md:ring-[var(--color-line)]">
        <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto ${hideChrome ? "" : "app-content-padding"}`}>
          {children}
        </div>
        {!hideChrome && <BottomNavigation />}
      </div>
    </div>
  );
}
