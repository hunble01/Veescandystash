// Content model (brief §15). Shaped so each type maps 1:1 to a Sanity
// document type in Phase 2. `null` always means "owner hasn't confirmed yet".

export type StockStatus = "in_stock" | "low_stock" | "sold_out" | "unknown";
export type CollectionStatus = "coming_soon" | "available_now" | "closed";
export type ProductType = "mix" | "builder" | "occasion_preset";
export type Accent = "orange" | "pink" | "teal" | "red" | "green" | "gold"; // red/green/gold: holidays only

export interface SizeVariant {
  id: string;
  label: string;
  weightGrams: number | null;
  pickAllowance: number | null;
  priceCents: number | null;
  photo: string | null;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  type: ProductType;
  flavour: "sweet" | "sour" | "sweet_sour" | "your_pick" | "surprise";
  accent: Accent;
  sizes: SizeVariant[];
  photos: string[];
  active: boolean;
  stockStatus: StockStatus;
  ingredientsAllergens: string | null;
  prepTime: string | null;
}

export interface CandyOption {
  id: string;
  name: string;
  category: "sweet" | "sour" | "chocolate" | "other";
  photo: string | null;
  ingredientsAllergens: string | null;
  inStock: boolean | null;
  extraChargeCents: number | null;
}

// A ready-made look Vee offers for an occasion or holiday, e.g. red and
// green candy with a holiday message tag.
export interface Theme {
  name: string;
  description: string;
}

export interface Occasion {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  ideas: string[];
  themes: Theme[];
  accent: Accent;
  bannerImage: string | null;
  productIds: string[];
  featuredOnHome: boolean;
}

export interface SeasonalCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  ideas: string[];
  themes: Theme[];
  accent: Accent;
  status: CollectionStatus;
  orderCutoff: string | null;
  active: boolean;
  /** Ready-to-order products shown on the holiday page (e.g. the Christmas advent calendar). Optional in local data. */
  productIds?: string[];
}

export interface PackagingOption {
  id: string;
  label: string;
  priceDeltaCents: number | null;
  available: boolean | null;
}

// Buttons that can appear under an FAQ answer. Email and phone only show
// once they're filled in under contact in src/config/site.ts.
export type FaqLink = "shop" | "build" | "occasions" | "custom" | "email" | "phone" | "contact" | "policies";

export interface FaqItem {
  question: string;
  answer: string | null;
  topic: "Ordering" | "Pickup & delivery" | "Custom orders" | "Candy" | "Policies";
  links?: FaqLink[] | null;
}
