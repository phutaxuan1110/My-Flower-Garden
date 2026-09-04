import { useEffect, useRef, useState } from "react";

/**
 * A deliberately sparse, CSS-driven atmosphere layer for the first garden.
 * The source illustration remains completely static; this SVG only adds a
 * few matching edge plants, sparkles and wind traces above it. Intersection
 * Observer pauses every animation when its garden is off-screen.
 */
export function GardenAmbientLayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const isIntersectingRef = useRef(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncActivity = () => setIsActive(isIntersectingRef.current && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncActivity();
      },
      { threshold: [0, 0.15, 0.5] }
    );

    observer.observe(root);
    document.addEventListener("visibilitychange", syncActivity);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="garden-ambient pointer-events-none absolute inset-0 overflow-hidden"
      data-active={isActive ? "true" : "false"}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 572 1024"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <g className="garden-ambient__plants" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(22 706)">
            <g className="garden-ambient__plant garden-ambient__plant--1">
              <path d="M8 53 C7 35 8 17 13 1 M10 31 C2 27 0 20 1 15 M11 22 C20 19 23 12 22 6" />
              <path d="M14 52 C17 38 24 27 34 20 M23 35 C31 36 36 31 38 26" />
            </g>
          </g>
          <g transform="translate(500 681)">
            <g className="garden-ambient__plant garden-ambient__plant--2">
              <path d="M21 61 C21 42 17 20 9 2 M18 39 C8 36 4 28 4 20 M19 30 C29 25 31 17 29 10" />
              <path d="M23 60 C28 43 35 32 44 23 M32 40 C42 41 47 35 49 29" />
            </g>
          </g>
          <g transform="translate(37 866)">
            <g className="garden-ambient__plant garden-ambient__plant--3">
              <path d="M15 63 C14 43 17 24 25 5 M18 42 C8 39 3 31 4 22 M20 31 C30 29 36 20 36 12" />
              <path d="M13 62 C9 47 4 38 0 32" />
            </g>
          </g>
          <g transform="translate(515 855)">
            <g className="garden-ambient__plant garden-ambient__plant--4">
              <path d="M18 67 C19 46 16 24 9 4 M17 45 C7 40 3 32 4 23 M17 34 C27 30 32 21 31 13" />
              <path d="M21 66 C26 49 34 39 43 32" />
            </g>
          </g>
        </g>

        <g className="garden-ambient__sparkles" fill="currentColor">
          <circle className="garden-ambient__sparkle garden-ambient__sparkle--1" cx="66" cy="56" r="3.1" />
          <path className="garden-ambient__sparkle garden-ambient__sparkle--2" d="M166 155 v22 M155 166 h22" />
          <circle className="garden-ambient__sparkle garden-ambient__sparkle--3" cx="474" cy="118" r="3.6" />
          <circle className="garden-ambient__sparkle garden-ambient__sparkle--4" cx="510" cy="190" r="2.5" />
          <path className="garden-ambient__sparkle garden-ambient__sparkle--5" d="M132 234 v16 M124 242 h16" />
          <circle className="garden-ambient__sparkle garden-ambient__sparkle--6" cx="446" cy="302" r="2.4" />
        </g>

        <g className="garden-ambient__wind" fill="none" strokeLinecap="round">
          <path className="garden-ambient__wind-line garden-ambient__wind-line--1" d="M86 208 C136 194 187 214 238 202" />
          <path className="garden-ambient__wind-line garden-ambient__wind-line--2" d="M348 340 C390 328 436 344 486 332" />
        </g>
      </svg>
    </div>
  );
}
