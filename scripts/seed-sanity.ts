// Copies the draft content in src/data/ into Sanity so the Studio starts
// with something to edit. Safe to re-run: it only creates documents that
// don't exist yet and never overwrites Vee's edits.
//
// Already run once (2026-10-26). To re-run on Node 22+:
//   node --env-file=.env.local node_modules/sanity/bin/sanity exec scripts/seed-sanity.ts

import { createClient } from "@sanity/client";
import { candies } from "../src/data/candies";
import { faq } from "../src/data/faq";
import { occasions, seasonalCollections } from "../src/data/occasions";
import { products } from "../src/data/products";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first.");

const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-10-01",
  token,
  useCdn: false,
});

const slug = (current: string) => ({ _type: "slug", current });
// Drop nulls so unconfirmed values stay empty in the Studio.
const clean = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));

const docs: { _id: string; _type: string; [field: string]: unknown }[] = [
  ...products.map((p, i) => ({
    _id: `product-${p.id}`,
    _type: "product",
    name: p.name,
    slug: slug(p.slug),
    summary: p.summary,
    description: p.description,
    type: p.type,
    flavour: p.flavour,
    accent: p.accent,
    sizes: p.sizes.map((s) => ({
      _key: s.id,
      _type: "sizeVariant",
      ...clean({
        label: s.label,
        price: s.priceCents == null ? null : s.priceCents / 100,
        weightGrams: s.weightGrams,
        pickAllowance: s.pickAllowance,
      }),
      active: s.active,
    })),
    stockStatus: p.stockStatus,
    active: p.active,
    sortOrder: (i + 1) * 10,
  })),
  ...candies.map((c, i) => ({
    _id: `candy-${c.id}`,
    _type: "candyOption",
    name: c.name,
    category: c.category,
    inStock: true,
    sortOrder: (i + 1) * 10,
  })),
  ...occasions.map((o, i) => ({
    _id: `occasion-${o.id}`,
    _type: "occasion",
    name: o.name,
    slug: slug(o.slug),
    shortName: o.shortName,
    tagline: o.tagline,
    description: o.description,
    ideas: o.ideas,
    accent: o.accent,
    products: o.productIds.map((id) => ({ _key: id, _type: "reference", _ref: `product-${id}` })),
    featuredOnHome: o.featuredOnHome,
    sortOrder: (i + 1) * 10,
  })),
  ...seasonalCollections.map((c, i) => ({
    _id: `seasonal-${c.id}`,
    _type: "seasonalCollection",
    name: c.name,
    slug: slug(c.slug),
    description: c.description,
    ideas: c.ideas,
    accent: c.accent,
    status: c.status,
    active: c.active,
    sortOrder: (i + 1) * 10,
  })),
  ...faq.map((f, i) => ({
    _id: `faq-${i + 1}`,
    _type: "faqItem",
    question: f.question,
    topic: f.topic,
    sortOrder: (i + 1) * 10,
  })),
];

async function main() {
  const tx = client.transaction();
  docs.forEach((d) => tx.createIfNotExists(d));
  await tx.commit();
  const counts = docs.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d._type]: (acc[d._type] ?? 0) + 1 }), {});
  console.log("Seeded (existing documents left untouched):", counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
