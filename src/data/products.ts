import type { Product, SizeVariant } from "@/lib/types";

// DRAFT CATALOGUE. Product names and descriptions come from the brief (§3).
// Sizes were only brainstormed: weights, pick allowances and prices are null
// until Vee confirms them after sourcing and testing. In Phase 2 this file is
// replaced by Sanity documents with the same fields.

const brainstormedSizes = (productId: string): SizeVariant[] =>
  ["Mini", "Small", "Medium", "Large"].map((label) => ({
    id: `${productId}-${label.toLowerCase()}`,
    label,
    weightGrams: null,
    pickAllowance: null,
    priceCents: null,
    photo: null,
    active: true,
  }));

// Build Your Own sizes chosen by Vee (2026-10-27). Weights are the pound
// sizes converted to grams. Prices set by Vee (2026-11-04); 5 lb became 4 lb. Pick limits set by
// Vee (2026-10-29); the same candy can fill several picks. No pick limit
// (null) means customers choose as many candies as they like.
const builderSizes: SizeVariant[] = [
  { label: "0.5 lb", grams: 227, picks: 5, price: 1599 },
  { label: "1 lb", grams: 454, picks: 10, price: 2699 },
  { label: "2 lb", grams: 907, picks: 15, price: 5199 },
  { label: "4 lb", grams: 1814, picks: 20, price: 8500 },
].map(({ label, grams, picks, price }) => ({
  id: `build-your-own-${grams}g`,
  label,
  weightGrams: grams,
  pickAllowance: picks,
  priceCents: price,
  photo: null,
  active: true,
}));

export const products: Product[] = [
  {
    id: "signature-mixed",
    slug: "signature-mixed-stash",
    name: "Signature Mixed Stash",
    summary: "A little of everything: our curated mix of favourites.",
    description:
      "A curated assortment of sweet and sour candy types. A great first stash and an easy gift.",
    type: "mix",
    flavour: "sweet_sour",
    accent: "orange",
    sizes: brainstormedSizes("signature-mixed"),
    photos: [],
    active: true,
    stockStatus: "unknown",
    ingredientsAllergens: null,
    prepTime: null,
  },
  {
    id: "sour",
    slug: "sour-stash",
    name: "Sour Stash",
    summary: "Pucker up. Sour belts, sour gummies and more.",
    description:
      "A mix focused on sour candies such as sour belts, strips and sour gummies.",
    type: "mix",
    flavour: "sour",
    accent: "teal",
    sizes: brainstormedSizes("sour"),
    photos: [],
    active: true,
    stockStatus: "unknown",
    ingredientsAllergens: null,
    prepTime: null,
  },
  {
    id: "sweet",
    slug: "sweet-stash",
    name: "Sweet Stash",
    summary: "Soft, sweet, no-pucker favourites.",
    description: "Non-sour gummies and other sweet favourites.",
    type: "mix",
    flavour: "sweet",
    accent: "pink",
    sizes: brainstormedSizes("sweet"),
    photos: [],
    active: true,
    stockStatus: "unknown",
    ingredientsAllergens: null,
    prepTime: null,
  },
  {
    id: "sweet-sour",
    slug: "sweet-and-sour-stash",
    name: "Sweet + Sour Stash",
    summary: "The best of both, in one bag.",
    description: "A combined assortment of sweet and sour favourites.",
    type: "mix",
    flavour: "sweet_sour",
    accent: "orange",
    sizes: brainstormedSizes("sweet-sour"),
    photos: [],
    active: true,
    stockStatus: "unknown",
    ingredientsAllergens: null,
    prepTime: null,
  },
  {
    id: "build-your-own",
    slug: "build-your-own-stash",
    name: "Build Your Own Stash",
    summary: "Pick your size, then pick your favourites.",
    description:
      "Choose a bag size and fill it with the candies you love, up to the number of picks your size allows.",
    type: "builder",
    flavour: "your_pick",
    accent: "pink",
    sizes: builderSizes,
    photos: [],
    active: true,
    stockStatus: "unknown",
    ingredientsAllergens: null,
    prepTime: null,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const activeProducts = () => products.filter((p) => p.active);
