import { useEffect, useRef, useState } from "react";
import wisteriaLeft from "../assets/garden/ambient/river-wisteria-left.png";
import wisteriaRight from "../assets/garden/ambient/river-wisteria-right.png";
import lavender from "../assets/garden/ambient/river-lavender.png";
import glow from "../assets/garden/ambient/river-glow.png";
import shimmerA from "../assets/garden/ambient/river-shimmer-a.png";
import shimmerB from "../assets/garden/ambient/river-shimmer-b.png";
import shimmerC from "../assets/garden/ambient/river-shimmer-c.png";

/**
 * Ambient layer for the second garden (the river). Unlike GardenAmbientLayer,
 * nothing here is painted out of the backdrop first — none of these sprites
 * matched an existing part of my-flower-garden-river.png (confirmed by
 * template-matching against it), so they're new decorative additions layered
 * on top: wisteria draping in from both top corners, a lavender clump in the
 * bottom-left bank, and a few faint light/shimmer traces on the water.
 *
 * Coordinates are in the background artwork's own pixel space (934x1672,
 * matching my-flower-garden-river.png) and converted to percentages, same
 * approach as GardenAmbientLayer.
 */
const ART_W = 934;
const ART_H = 1672;

function pct(px: number, total: number) {
  return `${(px / total) * 100}%`;
}

interface SpriteSpec {
  src: string;
  className: string;
  x: number;
  y: number;
  w: number;
  h: number;
  origin: string;
}

// Wisteria + lavender sway gently like real plants; transform-origin sits at
// their attachment point (top edge for the hanging wisteria, base for the
// grounded lavender) so they pivot naturally instead of rotating around
// their own bounding-box center.
const SWAYING: SpriteSpec[] = [
  // The source filenames describe the direction the branch grows from, not
  // the corner it should occupy: `right` attaches to the artwork's left edge
  // and `left` attaches to its right edge. Keep each sprite at its native
  // dimensions so swapping them does not stretch the painted linework.
  { src: wisteriaRight, className: "river-ambient__object river-ambient__wisteria river-ambient__wisteria--left", x: 0, y: 0, w: 281, h: 317, origin: "15% 0%" },
  { src: wisteriaLeft, className: "river-ambient__object river-ambient__wisteria river-ambient__wisteria--right", x: 635, y: 0, w: 299, h: 242, origin: "85% 0%" },
  { src: lavender, className: "river-ambient__object river-ambient__lavender", x: 0, y: 1440, w: 108, h: 218, origin: "40% 100%" },
];

// Light/water effects glimmer in place rather than swaying — there's no
// "stem" for these to pivot from.
const GLIMMERING: SpriteSpec[] = [
  { src: glow, className: "river-ambient__glimmer river-ambient__glimmer--1", x: 500, y: 150, w: 124, h: 184, origin: "50% 50%" },
  { src: shimmerA, className: "river-ambient__glimmer river-ambient__glimmer--2", x: 150, y: 600, w: 313, h: 84, origin: "50% 50%" },
  { src: shimmerB, className: "river-ambient__glimmer river-ambient__glimmer--3", x: 420, y: 1030, w: 331, h: 118, origin: "50% 50%" },
  { src: shimmerC, className: "river-ambient__glimmer river-ambient__glimmer--4", x: 600, y: 1250, w: 34, h: 65, origin: "50% 50%" },
];

export function RiverAmbientLayer() {
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

  const sprites = [...SWAYING, ...GLIMMERING];

  return (
    <div
      ref={rootRef}
      className="garden-ambient pointer-events-none absolute inset-0 overflow-hidden"
      data-active={isActive ? "true" : "false"}
      aria-hidden="true"
    >
      {sprites.map((s) => (
        <img
          key={s.className}
          src={s.src}
          alt=""
          draggable={false}
          className={s.className}
          style={{
            position: "absolute",
            left: pct(s.x, ART_W),
            top: pct(s.y, ART_H),
            width: pct(s.w, ART_W),
            height: pct(s.h, ART_H),
            transformOrigin: s.origin,
          }}
        />
      ))}
    </div>
  );
}
