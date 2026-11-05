import type { CandyOption } from "@/lib/types";

// CANDY LIST for Build Your Stash: Vee's 21 candies (2026-10-30), in her
// order. Sweet/sour groupings are a first guess from the names for Vee to
// check. Photos come later, and stock is unknown (null) until she sets it,
// all in the Studio (🍭 Candy options). This file is only the fallback when
// the Studio can't be reached.

const draft = (id: string, name: string, category: CandyOption["category"]): CandyOption => ({
  id,
  name,
  category,
  photo: null,
  ingredientsAllergens: null,
  inStock: null,
  extraChargeCents: null,
});

export const candies: CandyOption[] = [
  draft("allan-candy-sour-watermelon", "Allan Candy Sour Watermelon", "sour"),
  draft("kervan-gummi-peach-rings", "Kervan Gummi Peach Rings", "sweet"),
  draft("albanese-berry-red-raspberries", "Albanese Berry Red Raspberries", "sweet"),
  draft("albanese-strawberry", "Albanese Strawberry", "sweet"),
  draft("gustafs-strawberry-lace", "Gustaf's Strawberry Lace", "sweet"),
  draft("mccormicks-sour-green-apple", "McCormick's Sour Green Apple", "sour"),
  draft("albanese-rainforest-gummi-frogs", "Albanese Rainforest Gummi Frogs", "sweet"),
  draft("koala-pop-bottle-cola-bottles", "Koala Pop Bottle Cola Bottles", "sweet"),
  draft("sour-cherry-cola", "Gummy Zone Sour Cherry Cola", "sour"),
  draft("koala-sour-juicy-blues", "Koala Sour Juicy Blues", "sour"),
  draft("koala-sour-juice-berries", "Koala Sour Juicy Berries", "sour"),
  draft("kervan-blue-raspberry-rings", "Kervan Blue Raspberry Rings", "sweet"),
  draft("disco-crunchy-asteroids", "Disco Crunchy Asteroids", "sweet"),
  draft("strawberry-bon-bons", "Strawberry Bon Bons", "sweet"),
  draft("gustafs-blue-raspberry-lace", "Gustaf's Blue Raspberry Lace", "sweet"),
  draft("huer-bubblegum-bottles-gummies", "Huer Bubblegum Bottles Gummies", "sweet"),
  draft("kervan-gummi-worms", "Kervan Gummi Worms", "sweet"),
  draft("albanese-sour-gummi-poppers", "Albanese Sour Gummi Poppers", "sour"),
  draft("koala-cream-soda-float", "Koala Cream Soda Float", "sweet"),
  draft("kervan-apple-rings-gummies", "Kervan Apple Rings Gummies", "sweet"),
  draft("ccc-sweet-peach-slices", "CCC Sweet Peach Slices", "sweet"),
];
