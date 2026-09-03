import gardenImage from "../assets/garden/my-flower-garden-empty.png";

/**
 * The garden's illustrated background. Rendered as a real <img> (not a CSS
 * background-image) so it participates in normal layout and can be sized
 * with object-fit; imported through Vite so it's bundled as a hashed,
 * cacheable asset rather than inlined as base64.
 */
export function GardenBackdrop() {
  return (
    <img
      src={gardenImage}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full select-none object-contain"
      draggable={false}
    />
  );
}
