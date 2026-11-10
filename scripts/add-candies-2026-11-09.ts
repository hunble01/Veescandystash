// Adds Vee's 11 new candies (2026-11-09) to the Studio as DRAFTS, so they
// show in the local preview (SANITY_PREVIEW_DRAFTS=1) but not on the live
// site until they're published in the Studio. Safe to re-run.
//   npx tsx --env-file=.env.local scripts/add-candies-2026-11-09.ts
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first.");

const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const newCandies: [string, string, "sweet" | "sour"][] = [
  ["vidal-mini-rainbow-belts", "Vidal Mini Rainbow Belts", "sour"],
  ["swizzles-squashies-bubble-gum", "Swizzels Squashies Original Bubblegum", "sweet"],
  ["zweet-sour-belts-cotton-candy", "Zweet Sour Belts Cotton Candy", "sour"],
  ["huer-orange-slices-gummies", "Huer Orange Slices Gummies", "sweet"],
  ["albanese-white-strawberry-banana-bears", "Albanese White Strawberry Banana Gummi Bears", "sweet"],
  ["swizzles-squashies-cherry-apple", "Swizzels Squashies Original Cherry Apple", "sweet"],
  ["huer-mango-frosty", "Huer Mango Frosty", "sweet"],
  ["koala-red-band-sour-keys", "Koala Red Band Sour Keys", "sour"],
  ["bubs-sour-skull-lemon-raspberry", "Bubs Sour Skull Lemon Raspberry", "sour"],
  ["bubs-sour-diamond-strawberry-vanilla", "Bubs Sour Diamond Strawberry & Vanilla", "sour"],
  ["gerrits-satellite-wafers", "Gerrit's Satellite Wafers", "sweet"],
];

async function main() {
  const max = await client.fetch<number | null>(`math::max(*[_type == "candyOption"].sortOrder)`);
  let order = (max ?? 0) + 10;
  const tx = client.transaction();
  for (const [id, name, category] of newCandies) {
    tx.createIfNotExists({ _id: `drafts.candy-${id}`, _type: "candyOption", name, category, inStock: true, sortOrder: order });
    order += 10;
  }
  await tx.commit();
  console.log(`Added ${newCandies.length} candy drafts (sort order from ${(max ?? 0) + 10}).`);
}

main();
