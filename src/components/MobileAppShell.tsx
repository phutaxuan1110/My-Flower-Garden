import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
 * Root cause of "the bottom nav sits with a visible gap above the real
 * bottom edge of the screen" (nav renders, but with the page's own
 * background peeking in beneath it): unlike the splash screen (`App.tsx`),
 * `OnboardingPage`, and `LoginPage` — which all pin themselves with
 * `fixed inset-0` in *addition* to `.full-bleed-height` — this shell only
 * had the height class. `height: 100dvh` is usually accurate, but it's a
 * measured value that can briefly lag the real visual viewport (e.g. while
 * Safari's toolbar is mid-animation when the screenshot/paint happens), so
 * the shell came out a little shorter than the actual screen and the nav
 * (pinned to *this shell's* bottom edge, not the screen's) sat above the
 * true bottom. `fixed inset-0` pins the shell directly to the viewport's
 * edges regardless of any measured height, matching the pattern already
 * used everywhere else in the app.
 */
export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const { isActive: isGardenEditActive } = useGardenEditMode();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isEnteringGardenEdit = searchParams.has("editBouquet");
  const isBouquetDetail = /^\/bouquet\/[^/]+\/?$/.test(pathname);
  const hideChrome = isGardenEditActive || isEnteringGardenEdit || isBouquetDetail;

  return (
    <div className="full-bleed-height fixed inset-0 w-full overflow-hidden bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] md:static md:inset-auto md:h-auto md:min-h-dvh md:w-auto md:overflow-visible md:flex md:items-center md:justify-center md:py-10">
      <div className="paper-grain relative mx-auto flex h-full w-full max-w-[480px] flex-col bg-[var(--color-bg)] md:h-auto md:min-h-[880px] md:rounded-[36px] md:shadow-2xl md:shadow-[var(--color-rose)]/15 md:ring-1 md:ring-[var(--color-line)]">
        <div className={`no-scrollbar flex-1 overflow-y-auto ${hideChrome ? "" : "app-content-padding"}`}>
          {children}
        </div>
        {!hideChrome && <BottomNavigation />}
      </div>
    </div>
  );
}
