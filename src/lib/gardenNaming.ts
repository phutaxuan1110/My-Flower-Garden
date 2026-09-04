// Auto-naming for garden areas ("maps"/"levels") beyond the very first one.
//
// The first area keeps its original name ("Garden Corner", or whatever the
// user has renamed it to) — this list only kicks in for area 2 onward, using
// English names inspired by Greek mythology, with a bias toward figures and
// places tied to flowers (Hyacinthus, Narcissus, Adonis, Chloris...) so the
// names still feel at home in a flower-garden app.
const GREEK_GARDEN_NAMES: string[] = [
  "Chloris Grove",
  "Hyacinth Vale",
  "Narcissus Pool",
  "Anemone Fields",
  "Adonis Garden",
  "Persephone's Meadow",
  "Elysian Bloom",
  "Arcadia Grove",
  "Nysa Valley",
  "Aphrodite's Bower",
  "Tempe Vale",
  "Amaranth Grove",
];

/**
 * Deterministic display name for a garden area, based on its 0-based
 * `order` (see GardenArea.order / repository.createGardenArea). Deterministic
 * on purpose: a "locked next area" preview computed purely for display (see
 * gardenLock.ts) must always predict the exact same name the area will get
 * once it's actually created.
 */
export function generateAreaName(order: number): string {
  if (order <= 0) return "Garden Corner";
  const idx = order - 1;
  const cycle = Math.floor(idx / GREEK_GARDEN_NAMES.length);
  const base = GREEK_GARDEN_NAMES[idx % GREEK_GARDEN_NAMES.length];
  return cycle === 0 ? base : `${base} II`.replace("II", romanNumeral(cycle + 1));
}

function romanNumeral(n: number): string {
  const numerals: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let remaining = n;
  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}
