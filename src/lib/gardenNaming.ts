// Auto-naming for garden areas ("maps"/"levels").
//
// The first two areas have fixed, hand-picked names; from area 3 onward the
// list below cycles through English names inspired by Greek mythology, with
// a bias toward figures and places tied to flowers or water so they still
// feel at home in a flower-garden app.
const GREEK_GARDEN_NAMES: string[] = [
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
  if (order <= 0) return "Hera's Sacred Garden";
  if (order === 1) return "Castalian Spring";
  const idx = order - 2;
  const cycle = Math.floor(idx / GREEK_GARDEN_NAMES.length);
  const base = GREEK_GARDEN_NAMES[idx % GREEK_GARDEN_NAMES.length];
  return cycle === 0 ? base : `${base} ${romanNumeral(cycle + 1)}`;
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
