// Vee's own candy photos (2026-11-05, from her "candy selection" folder):
// cut to the round dish and lightly enhanced, stored in
// public/candies/<candy id>.webp. A photo uploaded in the Studio
// (🍭 Candy options) always wins over these.
const ids = [
  "albanese-berry-red-raspberries",
  "albanese-rainforest-gummi-frogs",
  "albanese-sour-gummi-poppers",
  "albanese-strawberry",
  "allan-candy-sour-watermelon",
  "ccc-sweet-peach-slices",
  "disco-crunchy-asteroids",
  "gustafs-blue-raspberry-lace",
  "gustafs-strawberry-lace",
  "huer-bubblegum-bottles-gummies",
  "kervan-apple-rings-gummies",
  "kervan-blue-raspberry-rings",
  "kervan-gummi-peach-rings",
  "kervan-gummi-worms",
  "koala-cream-soda-float",
  "koala-pop-bottle-cola-bottles",
  "koala-sour-juice-berries",
  "koala-sour-juicy-blues",
  "mccormicks-sour-green-apple",
  "sour-cherry-cola",
  "strawberry-bon-bons",
];

// Vee's "new candy" folder (2026-11-13). Saved as <candy id>-2.webp so
// browsers don't keep showing an earlier cut of the same photo.
const newCandy = [
  "albanese-white-strawberry-banana-bears",
  "bubs-sour-diamond-strawberry-vanilla",
  "bubs-sour-skull-lemon-raspberry",
  "gerrits-satellite-wafers",
  "huer-mango-frosty",
  "huer-orange-slices-gummies",
  "koala-red-band-sour-keys",
  "swizzles-squashies-bubble-gum",
  "swizzles-squashies-cherry-apple",
  "vidal-mini-rainbow-belts",
  "zweet-sour-belts-cotton-candy",
];

// Names from Vee's photo file names (2026-11-05: "use those names on the
// website"). These override the Studio names until the Studio is updated.
const names: Record<string, string> = {
  "albanese-strawberry": "Albanese Strawberry Banana Rings",
  "koala-sour-juice-berries": "Koala Sour Juice Berries",
  "mccormicks-sour-green-apple": "McCormick Sour Green Apple Balls",
};

const key = (id: string) => id.replace(/^candy-/, "");

/** Photo for a candy id (Studio ids look like "candy-<id>"), or null. */
export function candyPhoto(id: string): string | null {
  const k = key(id);
  if (newCandy.includes(k)) return `/candies/${k}-2.webp`;
  return ids.includes(k) ? `/candies/${k}.webp` : null;
}

/** Vee's file-name version of a candy's name, if it differs. */
export function candyName(id: string, fallback: string): string {
  return names[key(id)] ?? fallback;
}
