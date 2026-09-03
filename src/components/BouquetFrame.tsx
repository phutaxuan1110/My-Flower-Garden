import type { FrameStyle } from "../types";
import type { CSSProperties } from "react";

interface BouquetFrameProps {
  imageUrl: string;
  frameStyle: FrameStyle;
  alt: string;
  className?: string;
  rounded?: boolean;
  style?: CSSProperties;
}

const HEART_PATH =
  "path('M50 90C50 90 8 58 8 32C8 16 20 6 34 6C42 6 48 11 50 18C52 11 58 6 66 6C80 6 92 16 92 32C92 58 50 90 50 90Z')";

const CLIP_PATHS: Record<FrameStyle, string> = {
  "kraft-cone": "polygon(12% 0%, 88% 0%, 68% 100%, 32% 100%)",
  "ribbon-round": "circle(50% at 50% 50%)",
  arch: "none",
  hexagon: "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
  heart: HEART_PATH,
  "classic-circle": "circle(50% at 50% 50%)",
};

export function BouquetFrame({ imageUrl, frameStyle, alt, className = "", rounded, style }: BouquetFrameProps) {
  const clipPath = CLIP_PATHS[frameStyle];
  const isArch = frameStyle === "arch";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={style}>
      <div
        className={`h-full w-full overflow-hidden bg-[var(--color-blush)] ${
          isArch ? "rounded-t-[45%] rounded-b-lg" : rounded ? "rounded-2xl" : ""
        }`}
        style={clipPath !== "none" ? { clipPath, WebkitClipPath: clipPath } : undefined}
      >
        <img src={imageUrl} alt={alt} className="no-native-drag h-full w-full object-cover" draggable={false} />
      </div>

      {frameStyle === "ribbon-round" && (
        <svg
          viewBox="0 0 100 40"
          className="pointer-events-none absolute -bottom-2 left-1/2 w-2/5 -translate-x-1/2"
          aria-hidden="true"
        >
          <path
            d="M50 10 L25 0 L15 15 L35 20 L15 25 L25 40 L50 30 L75 40 L85 25 L65 20 L85 15 L75 0 Z"
            fill="var(--color-rose)"
            opacity="0.9"
          />
          <circle cx="50" cy="20" r="7" fill="var(--color-rose)" />
        </svg>
      )}

      {frameStyle === "kraft-cone" && (
        <svg
          viewBox="0 0 100 20"
          className="pointer-events-none absolute -bottom-1 left-1/2 w-1/3 -translate-x-1/2"
          aria-hidden="true"
        >
          <rect x="20" y="4" width="60" height="6" rx="3" fill="var(--color-leaf)" opacity="0.85" />
          <circle cx="50" cy="7" r="6" fill="var(--color-butter)" />
        </svg>
      )}

      {frameStyle === "heart" && (
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute -top-2 left-1/2 w-6 -translate-x-1/2"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="3" fill="var(--color-rose)" opacity="0.85" />
        </svg>
      )}
    </div>
  );
}
