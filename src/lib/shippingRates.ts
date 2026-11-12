// Flat shipping prices (Vee, 2026-11-11): one price per region for each
// candy-weight step. Vee edits them in the Studio ("🚚 Shipping prices");
// site.fulfilment.shipping.flatRates is the fallback. Plain module, safe to
// use anywhere.

import { site } from "@/config/site";

export const REGIONS = ["ontario", "restOfCanada", "usa", "world"] as const;
export type Region = (typeof REGIONS)[number];

export interface ShippingRates {
  /** Cents per weight step (site.fulfilment.shipping.weightStepsLb, then "over"). null = not shipped there. */
  flatRates: Record<Region, number[] | null>;
  /** Free shipping within Canada when the subtotal reaches this. null = never. */
  freeInCanadaOverCents: number | null;
}

export const fallbackShippingRates: ShippingRates = {
  flatRates: site.fulfilment.shipping.flatRates,
  freeInCanadaOverCents: site.fulfilment.shipping.freeInCanadaOverCents,
};

const money = (cents: number) => `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;
const PLACE: Record<Region, string> = { ontario: "in Ontario", restOfCanada: "rest of Canada", usa: "USA", world: "rest of the world" };

/** e.g. "Up to 1 lb: $10 in Ontario, $15 rest of Canada, … Up to 2 lb: $12, $18, …" */
export function shippingPriceText(rates: ShippingRates): string {
  const steps = site.fulfilment.shipping.weightStepsLb;
  const regions = REGIONS.filter((r) => rates.flatRates[r]?.length);
  if (!regions.length) return "";
  const labels = [...steps.map((lb) => `Up to ${lb} lb`), `Over ${steps[steps.length - 1]} lb`];
  const parts = labels.map((label, i) => {
    const prices = regions.map((r) => {
      const list = rates.flatRates[r]!;
      const cents = list[Math.min(i, list.length - 1)];
      return i === 0 ? `${money(cents)} ${PLACE[r]}` : money(cents);
    });
    return `${label}: ${prices.join(", ")}.`;
  });
  const free = rates.freeInCanadaOverCents != null ? ` Shipping in Canada is free on orders of ${money(rates.freeInCanadaOverCents)} or more.` : "";
  return parts.join(" ") + free;
}

/** Swaps "{shipping prices}" in a piece of text for the current price list. */
export const withShippingPrices = (text: string, rates: ShippingRates) =>
  text.includes("{shipping prices}") ? text.replaceAll("{shipping prices}", shippingPriceText(rates)) : text;
