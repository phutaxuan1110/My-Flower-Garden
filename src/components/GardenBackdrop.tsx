import gardenImage from "../assets/garden/my-flower-garden-empty.png";
// Only the very first garden (order 0) gets the ambient sprite treatment.
// Its tree/potted bush/flower-stem cluster/leaf cluster have been painted
// out of this variant by hand, leaving clean grass/sky behind — GardenAmbientLayer
// then places real cropped sprites of those same objects back on top at
// their original position so they can sway. Every other "garden"-themed area
// (order 2, 4, ...) still uses the plain, fully static `gardenImage` above.
import gardenImageClean from "../assets/garden/my-flower-garden-empty-clean.png";
// The river artwork itself is already free of any wisteria/lavender (nothing
// needed to be painted out for this one), so unlike the garden pair above
// there's a single river asset used everywhere theme is "river" — the first
// river area (order 1) just gets RiverAmbientLayer's sprites added on top of
// it for animation; every later river area shows the exact same artwork
// without that extra layer.
import riverImage from "../assets/garden/my-flower-garden-river.png";
import type { GardenTheme } from "../lib/gardenLayout";
import { GardenAmbientLayer } from "./GardenAmbientLayer";
import { RiverAmbientLayer } from "./RiverAmbientLayer";

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
  const showGardenAmbient = theme === "garden" && ambientAnimation;
  const showRiverAmbient = theme === "river" && ambientAnimation;
  const src = theme === "river" ? riverImage : showGardenAmbient ? gardenImageClean : gardenImage;
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
      {showGardenAmbient && <GardenAmbientLayer />}
      {showRiverAmbient && <RiverAmbientLayer />}
    </>
  );
}
