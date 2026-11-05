import type { Accent, CollectionStatus, Product, StockStatus } from "./types";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export const formatPrice = (cents: number | null) =>
  cents === null ? "Price coming soon" : cad.format(cents / 100);

// "From $X" across a product's sizes, or the placeholder when none are set.
export const priceFrom = (product: Product) => {
  const prices = product.sizes
    .filter((s) => s.active && s.priceCents !== null)
    .map((s) => s.priceCents as number);
  return prices.length ? `From ${cad.format(Math.min(...prices) / 100)}` : "Price coming soon";
};

export const stockLabel: Record<StockStatus, string | null> = {
  in_stock: "In stock",
  low_stock: "Almost gone",
  sold_out: "Sold out",
  unknown: null,
};

export const collectionStatusLabel: Record<CollectionStatus, string> = {
  coming_soon: "Coming soon",
  available_now: "Available now",
  closed: "Closed for the season",
};

export const flavourLabel: Record<Product["flavour"], string> = {
  sweet: "Sweet",
  sour: "Sour",
  sweet_sour: "Sweet + Sour",
  your_pick: "Your pick",
};

// Full class strings so Tailwind can see them.
export const accentClasses: Record<Accent, { soft: string; deep: string; solid: string; dot: string }> = {
  orange: { soft: "bg-orange-soft", deep: "text-orange-deep", solid: "bg-orange", dot: "#f07020" },
  pink: { soft: "bg-pink-soft", deep: "text-pink-deep", solid: "bg-pink", dot: "#ec6a99" },
  teal: { soft: "bg-teal-soft", deep: "text-teal-deep", solid: "bg-teal", dot: "#64beba" },
  red: { soft: "bg-holiday-red-soft", deep: "text-holiday-red-deep", solid: "bg-holiday-red", dot: "#c8202f" },
  green: { soft: "bg-holiday-green-soft", deep: "text-holiday-green-deep", solid: "bg-holiday-green", dot: "#17804a" },
  gold: { soft: "bg-holiday-gold-soft", deep: "text-holiday-gold-deep", solid: "bg-holiday-gold", dot: "#e8b931" },
};

// Solid backgrounds too dark for ink text.
export const darkAccents: Accent[] = ["red", "green"];

// Builder picks can repeat a candy: ["Sour Belts", "Sour Belts", "Gummy Bears"]
// reads "Sour Belts ×2, Gummy Bears", in the order they were first picked.
export const describePicks = (names: string[]) => {
  const counts = new Map<string, number>();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts].map(([n, c]) => (c > 1 ? `${n} ×${c}` : n)).join(", ");
};
