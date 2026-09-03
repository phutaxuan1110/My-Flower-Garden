import { useEffect, useState } from "react";

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mediaMatch = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari exposes this non-standard boolean on navigator instead of
  // supporting the display-mode media query reliably on older versions.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return Boolean(mediaMatch || iosStandalone);
}

/** Safe, read-only detection of installed/standalone PWA mode. Never assumes iOS
 * can be forced into this mode via script — it only reports what the browser
 * already reports. */
export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(detectStandalone);

  useEffect(() => {
    const mql = window.matchMedia?.("(display-mode: standalone)");
    if (!mql) return;
    const handler = () => setIsStandalone(detectStandalone());
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  return isStandalone;
}
