import type { CandyOption } from "@/lib/types";

// CANDY LIST for Build Your Stash: Vee's 21 candies (2026-10-30) plus 11 (2026-11-09), in her
// order. Sweet/sour groupings are a first guess from the names for Vee to
// check. Photos come later, and stock is unknown (null) until she sets it,
// all in the Studio (🍭 Candy options). This file is only the fallback when
// the Studio can't be reached.

const draft = (id: string, name: string, category: CandyOption["category"], vegan = false): CandyOption => ({
  id,
  vegan,
  name,
  category,
  photo: null,
  ingredientsAllergens: null,
  inStock: null,
  extraChargeCents: null,
});
// +$1.00 per pick (Vee, 2026-11-09).
const plus1 = (c: CandyOption): CandyOption => ({ ...c, extraChargeCents: 100 });

export const candies: CandyOption[] = [
  draft("allan-candy-sour-watermelon", "Allan Candy Sour Watermelon", "sour"),
  draft("kervan-gummi-peach-rings", "Kervan Gummi Peach Rings", "sweet"),
  draft("albanese-berry-red-raspberries", "Albanese Berry Red Raspberries", "sweet"),
  draft("albanese-strawberry", "Albanese Strawberry Banana Rings", "sweet"),
  draft("gustafs-strawberry-lace", "Gustaf's Strawberry Lace", "sweet"),
  draft("mccormicks-sour-green-apple", "McCormick Sour Green Apple Balls", "sour"),
  draft("albanese-rainforest-gummi-frogs", "Albanese Rainforest Gummi Frogs", "sweet"),
  draft("koala-pop-bottle-cola-bottles", "Koala Pop Bottle Cola Bottles", "sweet"),
  draft("sour-cherry-cola", "Gummy Zone Sour Cherry Cola", "sour"),
  draft("koala-sour-juicy-blues", "Koala Sour Juicy Blues", "sour"),
  draft("koala-sour-juice-berries", "Koala Sour Juice Berries", "sour"),
  draft("kervan-blue-raspberry-rings", "Kervan Blue Raspberry Rings", "sweet"),
  draft("disco-crunchy-asteroids", "Disco Crunchy Asteroids", "sweet"),
  plus1(draft("strawberry-bon-bons", "Strawberry Bon Bons", "sweet")),
  draft("gustafs-blue-raspberry-lace", "Gustaf's Blue Raspberry Lace", "sweet"),
  draft("huer-bubblegum-bottles-gummies", "Huer Bubblegum Bottles Gummies", "sweet"),
  draft("kervan-gummi-worms", "Kervan Gummi Worms", "sweet"),
  draft("albanese-sour-gummi-poppers", "Albanese Sour Gummi Poppers", "sour"),
  draft("koala-cream-soda-float", "Koala Cream Soda Float", "sweet"),
  draft("kervan-apple-rings-gummies", "Kervan Apple Rings Gummies", "sweet"),
  draft("ccc-sweet-peach-slices", "CCC Sweet Peach Slices", "sweet"),
  // 11 more from Vee, 2026-11-09 (Studio drafts until published there).
  draft("vidal-mini-rainbow-belts", "Vidal Mini Rainbow Belts", "sour"),
  draft("swizzles-squashies-bubble-gum", "Swizzels Squashies Original Bubblegum", "sweet"),
  draft("zweet-sour-belts-cotton-candy", "Zweet Sour Belts Cotton Candy", "sour"),
  draft("huer-orange-slices-gummies", "Huer Orange Slices Gummies", "sweet"),
  draft("albanese-white-strawberry-banana-bears", "Albanese White Strawberry Banana Gummi Bears", "sweet"),
  draft("swizzles-squashies-cherry-apple", "Swizzels Squashies Original Cherry Apple", "sweet"),
  draft("huer-mango-frosty", "Huer Mango Frosty", "sweet"),
  draft("koala-red-band-sour-keys", "Koala Red Band Sour Keys", "sour"),
  plus1(draft("bubs-sour-skull-lemon-raspberry", "Bubs Sour Skull Lemon Raspberry", "sour", true)),
  plus1(draft("bubs-sour-diamond-strawberry-vanilla", "Bubs Sour Diamond Strawberry & Vanilla", "sour", true)),
  draft("gerrits-satellite-wafers", "Gerrit's Satellite Wafers", "sweet"),
];
