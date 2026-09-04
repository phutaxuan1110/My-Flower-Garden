import gardenImage from "../assets/garden/my-flower-garden-empty.png";
import riverImage from "../assets/garden/my-flower-garden-river.png";
import type { GardenTheme } from "../lib/gardenLayout";
import { GardenAmbientLayer } from "./GardenAmbientLayer";

/**
 * The garden's illustrated background. Rendered as a real <img> (not a CSS
 * background-image) so it participates in normal layout and can be sized
 * with object-fit; imported through Vite so it's bundled as a hashed,
 * cacheable asset rather than inlined as base64.
 */
export function GardenBackdrop({
  theme = "garden",
  ambientAnimation = false,
}: {
  theme?: GardenTheme | string;
  ambientAnimation?: boolean;
}) {
  const src = theme === "river" ? riverImage : gardenImage;
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="no-callout absolute inset-0 h-full w-full select-none object-contain"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      {theme === "garden" && ambientAnimation && <GardenAmbientLayer />}
    </>
  );
}
