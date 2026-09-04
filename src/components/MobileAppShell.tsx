import React from "react";
import { createPortal } from "react-dom";
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
 * Fix: give the shell a *definite* height using the dynamic viewport unit
 * (`h-dvh`, with a `vh` fallback via the `.sheet-fill-height`-style pattern
 * baked into Tailwind's `dvh` utilities) so it always matches the actually
 * visible viewport and updates live as Safari's chrome shows/hides. The
 * inner content area then truly clips/scrolls within that fixed-height
 * shell, and the nav — pinned to the shell's bottom edge — stays exactly at
 * the visible bottom of the screen, including its safe-area inset.
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
 * On iOS standalone mode, a fixed descendant can still be clipped at the
 * shell's layout-viewport boundary while the physical safe-area region is
 * painted below it. The mobile nav is therefore portaled directly to body,
 * outside both overflow-clipping shell layers. Its CSS also paints an
 * overscan strip below the nav, so the home-indicator region remains covered
 * even while WebKit is reconciling the layout and visual viewports. Desktop
 * keeps the nav inside the centered app frame.
 *
 * Root cause of "the bottom nav covers quick-view / add-bouquet content
 * that should be above it" (z-[60]/z-50 overlays visually losing to the
 * nav's z-40): portaling the mobile nav to `document.body` above fixed the
 * clipping bug, but it also moved the nav *outside* this shell's own DOM
 * subtree. This shell's outer wrapper is itself `position: fixed`, which
 * unconditionally opens its own stacking context — every z-index used
 * anywhere inside the app (the quick-view sheet's z-[60], the add-bouquet
 * sheet's z-50, popups at z-[70]/z-[80]) is only ever compared *within*
 * that trapped context. The portaled nav sits one level up, a sibling of
 * that entire wrapper at the document body level, with its own explicit
 * z-40 — so it now beats the *whole app*, regardless of what z-index any
 * modal inside the app claims, because that modal's z-index never gets to
 * compete at the body level at all.
 *
 * No z-index arrangement can fix that from inside the trapped context, so
 * the fix doesn't try to win a stacking fight — it removes the nav from the
 * DOM entirely whenever something needs the full screen. `hideChrome` below
 * now also reads `isChromeHidden` from ChromeVisibilityProvider, a shared
 * registry that BouquetQuickView, AddBouquetSheet, GardenUnlockCelebration,
 * and ConfirmationDialog each register themselves into while open — so
 * every current (and future) full-screen or bottom-anchored overlay is
 * guaranteed never to have the nav painted over any part of it, independent
 * of any z-index value.
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
    <div className="full-bleed-height fixed inset-0 w-full overflow-hidden bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] md:static md:inset-auto md:h-auto md:min-h-dvh md:w-auto md:overflow-visible md:flex md:items-center md:justify-center md:py-10">
      <div className="paper-grain relative mx-auto flex h-full w-full max-w-[480px] flex-col bg-[var(--color-bg)] md:h-auto md:min-h-[880px] md:rounded-[36px] md:shadow-2xl md:shadow-[var(--color-rose)]/15 md:ring-1 md:ring-[var(--color-line)]">
        <div className={`no-scrollbar flex-1 overflow-y-auto ${hideChrome ? "" : "app-content-padding"}`}>
          {children}
        </div>
        {!hideChrome && (
          <div className="hidden md:block">
            <BottomNavigation />
          </div>
        )}
      </div>
      {!hideChrome &&
        createPortal(
          <div className="md:hidden">
            <BottomNavigation />
          </div>,
          document.body
        )}
    </div>
  );
}
