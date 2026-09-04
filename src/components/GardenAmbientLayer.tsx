import { useEffect, useRef, useState } from "react";
import treeSprite from "../assets/garden/ambient/tree.png";
import pottedBushSprite from "../assets/garden/ambient/potted-bush.png";
import flowerStemsSprite from "../assets/garden/ambient/flower-stems.png";
import leafClusterSprite from "../assets/garden/ambient/leaf-cluster.png";
import sparkleA from "../assets/garden/ambient/sparkle-a.png";
import sparkleB from "../assets/garden/ambient/sparkle-b.png";
import sparkleC from "../assets/garden/ambient/sparkle-c.png";

/**
 * The first garden's illustration (my-flower-garden-empty-clean.png) has had
 * its tree, potted bush, flower-stem cluster and leaf cluster painted out by
 * hand, leaving clean grass/sky behind. This layer places real cropped
 * sprites of those exact same objects back on top, at the exact pixel
 * position they used to occupy (see the `OBJECTS` table below), so what the
 * person sees at rest is pixel-identical to the original artwork — the only
 * difference is these copies can now sway.
 *
 * All coordinates are in the original artwork's pixel space (572x1024) and
 * converted to percentages here, so this still lines up correctly no matter
 * how the backdrop is scaled.
 */
const ART_W = 572;
const ART_H = 1024;

function pct(px: number, total: number) {
  return `${(px / total) * 100}%`;
}

interface SpriteSpec {
  src: string;
  className: string;
  /** Original top-left position + size in the 572x1024 artwork. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** transform-origin, as a CSS value, in the sprite's own local box. */
  origin: string;
}

const OBJECTS: SpriteSpec[] = [
  { src: treeSprite, className: "garden-ambient__object garden-ambient__tree", x: 26, y: 89, w: 129, h: 140, origin: "50% 96%" },
  { src: flowerStemsSprite, className: "garden-ambient__object garden-ambient__flowers", x: 0, y: 232, w: 73, h: 124, origin: "45% 92%" },
  { src: leafClusterSprite, className: "garden-ambient__object garden-ambient__leaves", x: 1, y: 622, w: 51, h: 76, origin: "35% 100%" },
  { src: pottedBushSprite, className: "garden-ambient__object garden-ambient__pot", x: 494, y: 597, w: 78, h: 89, origin: "50% 100%" },
];

interface SparkleSpec {
  src: string;
  className: string;
  x: number;
  y: number;
  w: number;
}

// New decorative twinkles — nothing at these spots matched the sparkle
// assets against the original artwork, so they aren't replacing anything;
// they're simply scattered into empty sky/grass gaps, clear of the bouquet
// placement slots and the objects above.
const SPARKLES: SparkleSpec[] = [
  { src: sparkleA, className: "garden-ambient__sparkle garden-ambient__sparkle--1", x: 250, y: 40, w: 22 },
  { src: sparkleB, className: "garden-ambient__sparkle garden-ambient__sparkle--2", x: 470, y: 260, w: 26 },
  { src: sparkleC, className: "garden-ambient__sparkle garden-ambient__sparkle--3", x: 170, y: 470, w: 14 },
];

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
      {OBJECTS.map((o) => (
        <img
          key={o.className}
          src={o.src}
          alt=""
          draggable={false}
          className={o.className}
          style={{
            position: "absolute",
            left: pct(o.x, ART_W),
            top: pct(o.y, ART_H),
            width: pct(o.w, ART_W),
            height: pct(o.h, ART_H),
            transformOrigin: o.origin,
          }}
        />
      ))}
      {SPARKLES.map((s) => (
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
            height: "auto",
          }}
        />
      ))}

      {/* Faint moving wind traces — new decorative additions, not extracted
          from the artwork, same as the sparkles above. */}
      <svg
        viewBox={`0 0 ${ART_W} ${ART_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute inset-0 h-full w-full"
        focusable="false"
      >
        <g className="garden-ambient__wind" fill="none" strokeLinecap="round">
          <path className="garden-ambient__wind-line garden-ambient__wind-line--1" d="M86 208 C136 194 187 214 238 202" />
          <path className="garden-ambient__wind-line garden-ambient__wind-line--2" d="M348 340 C390 328 436 344 486 332" />
        </g>
      </svg>
    </div>
  );
}
