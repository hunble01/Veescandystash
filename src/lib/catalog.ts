import { cacheLife } from "next/cache";
import { candies as localCandies } from "@/data/candies";
import { candyName, candyPhoto } from "@/data/candyPhotos";
import { faq as localFaq } from "@/data/faq";
import { occasions as localOccasions, seasonalCollections as localSeasonal } from "@/data/occasions";
import { products as localProducts } from "@/data/products";
import { readClient } from "@/sanity/client";
import { site } from "@/config/site";
import type { CandyOption, FaqItem, Occasion, Product, SeasonalCollection } from "./types";

// One place pages get catalogue content from. Reads Sanity when it's
// connected, otherwise the draft data files in src/data/. Cached for a few
// minutes so Vee's edits show up without a redeploy.

const toCents = (dollars: number | null | undefined) => (dollars == null ? null : Math.round(dollars * 100));

type SanityProduct = Omit<Product, "sizes"> & {
  sizes: { id: string; label: string; price?: number | null; weightGrams?: number | null; pickAllowance?: number | null; photo?: string | null; active?: boolean | null }[] | null;
};

const PRODUCTS = `*[_type == "product" && active != false] | order(coalesce(sortOrder, 999) asc, name asc){
  "id": _id, name, "slug": slug.current, summary, "description": coalesce(description, summary),
  type, flavour, "accent": coalesce(accent, "orange"),
  "sizes": sizes[]{ "id": _key, label, price, weightGrams, pickAllowance, "photo": photo.asset->url, active },
  "photos": coalesce(photos[].asset->url, []), "active": true,
  "stockStatus": coalesce(stockStatus, "unknown"), ingredientsAllergens, prepTime
}`;

const OCCASIONS = `*[_type == "occasion"] | order(coalesce(sortOrder, 999) asc, name asc){
  "id": _id, "slug": slug.current, name, shortName, "tagline": coalesce(tagline, ""), "description": coalesce(description, ""),
  "ideas": coalesce(ideas, []), "themes": coalesce(themes[]{ name, description }, []), "accent": coalesce(accent, "orange"), "bannerImage": bannerImage.asset->url,
  "productIds": coalesce(products[]._ref, []), "featuredOnHome": coalesce(featuredOnHome, false)
}`;

const SEASONAL = `*[_type == "seasonalCollection" && active != false] | order(coalesce(sortOrder, 999) asc, name asc){
  "id": _id, "slug": slug.current, name, "description": coalesce(description, ""), "ideas": coalesce(ideas, []),
  "themes": coalesce(themes[]{ name, description }, []), "accent": coalesce(accent, "teal"), "status": coalesce(status, "coming_soon"), orderCutoff, "active": true,
  "productIds": coalesce(products[]._ref, [])
}`;

type SanityCandy = Omit<CandyOption, "extraChargeCents"> & { extraCharge: number | null };

const CANDIES = `*[_type == "candyOption"] | order(coalesce(sortOrder, 999) asc, name asc){
  "id": _id, name, "category": coalesce(category, "other"), "photo": photo.asset->url,
  ingredientsAllergens, inStock, extraCharge, vegan
}`;

const FAQ = `*[_type == "faqItem"] | order(coalesce(sortOrder, 999) asc){ question, answer, topic, links }`;

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  const shown = (p: { slug: string }) => !site.hiddenProductSlugs.includes(p.slug);
  if (!readClient) return localProducts.filter((p) => p.active && shown(p));
  const docs = (await readClient.fetch<SanityProduct[]>(PRODUCTS)).filter(shown);
  return docs.map((d) => ({
    ...d,
    sizes: (d.sizes ?? []).map((s) => ({
      id: s.id,
      label: s.label,
      priceCents: toCents(s.price),
      weightGrams: s.weightGrams ?? null,
      pickAllowance: s.pickAllowance ?? null,
      photo: s.photo ?? null,
      active: s.active !== false,
    })),
  }));
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getOccasions(): Promise<Occasion[]> {
  "use cache";
  cacheLife("minutes");
  if (!readClient) return localOccasions;
  return readClient.fetch<Occasion[]>(OCCASIONS);
}

export async function getOccasion(slug: string) {
  return (await getOccasions()).find((o) => o.slug === slug);
}

export async function getSeasonalCollections(): Promise<SeasonalCollection[]> {
  "use cache";
  cacheLife("minutes");
  if (!readClient) return localSeasonal.filter((c) => c.active);
  return readClient.fetch<SeasonalCollection[]>(SEASONAL);
}

export async function getSeasonalCollection(slug: string) {
  return (await getSeasonalCollections()).find((c) => c.slug === slug);
}

export async function getFaq(): Promise<FaqItem[]> {
  "use cache";
  cacheLife("minutes");
  if (!readClient) return localFaq;
  return readClient.fetch<FaqItem[]>(FAQ);
}

export async function getCandies(): Promise<CandyOption[]> {
  "use cache";
  cacheLife("minutes");
  if (!readClient) return localCandies.map((c) => ({ ...c, name: candyName(c.id, c.name), photo: c.photo ?? candyPhoto(c.id) }));
  const docs = await readClient.fetch<SanityCandy[]>(CANDIES);
  return docs.map(({ extraCharge, ...d }) => ({
    ...d,
    name: candyName(d.id, d.name),
    photo: d.photo ?? candyPhoto(d.id),
    ingredientsAllergens: d.ingredientsAllergens ?? null,
    inStock: d.inStock ?? null,
    vegan: d.vegan ?? null,
    extraChargeCents: toCents(extraCharge),
  }));
}
