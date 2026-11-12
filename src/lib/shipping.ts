import "server-only";
import { site } from "@/config/site";
import { getShippingRates } from "@/lib/catalog";
import type { Region } from "@/lib/shippingRates";
import { canadaPostReady, ShippingProblem, shippingQuotes as canadaPostQuotes, type ShipAddress, type ShipQuote } from "@/lib/canadaPost";

// One place for shipping prices (Vee, 2026-11-10). Flat rates from the
// Studio (🚚 Shipping prices, fallback site.fulfilment.shipping.flatRates),
// or live Canada Post prices when shipping.pricing is "canadaPost".

export { ShippingProblem, type ShipQuote };

function regionFor({ country, postalCode }: ShipAddress): Region {
  if (country === "CA") return /^[KLMNP]/i.test(postalCode.trim()) ? "ontario" : "restOfCanada";
  return country === "US" ? "usa" : "world";
}

const offered = (r: number[] | null | undefined): r is number[] => r != null && r.length > 0;

/** Flat price by candy weight: one price per weightStepsLb step, then the last price. */
function flatPrice(prices: number[], parcelGrams: number) {
  const s = site.fulfilment.shipping;
  const candyLb = Math.max(0, parcelGrams - s.packagingGrams) / 453.6;
  const step = s.weightStepsLb.findIndex((lb) => candyLb <= lb + 0.01);
  return prices[Math.min(step === -1 ? s.weightStepsLb.length : step, prices.length - 1)];
}

/** Which countries can be shipped to: "all", or a short list of codes. */
export async function shippingCountries(): Promise<"all" | string[]> {
  if (site.fulfilment.shipping.pricing === "canadaPost") return "all";
  const r = (await getShippingRates()).flatRates;
  if (offered(r.world)) return "all";
  return [...(offered(r.ontario) || offered(r.restOfCanada) ? ["CA"] : []), ...(offered(r.usa) ? ["US"] : [])];
}

/** Short line for the checkout: where shipping goes. */
export async function shippingAreaText() {
  if (site.fulfilment.shipping.pricing === "canadaPost") return "Anywhere in Canada or around the world.";
  const r = (await getShippingRates()).flatRates;
  const canada = offered(r.ontario) && offered(r.restOfCanada) ? "Canada" : offered(r.ontario) ? "Ontario" : offered(r.restOfCanada) ? "Canada (outside Ontario)" : null;
  const places = [canada, offered(r.usa) ? "the USA" : null, offered(r.world) ? "the rest of the world" : null].filter(Boolean) as string[];
  if (!places.length) return "";
  const list = places.length === 1 ? places[0] : `${places.slice(0, -1).join(", ")} and ${places[places.length - 1]}`;
  return `We ship to ${list}.`;
}

/** True when checkout can offer shipping. */
export async function shippingReady() {
  if (site.fulfilment.shipping.pricing === "canadaPost") return canadaPostReady();
  return Object.values((await getShippingRates()).flatRates).some(offered);
}

/** Shipping price for this address (flat prices from the Studio, or live Canada Post). */
export async function shippingQuotes(to: ShipAddress, grams: number, subtotalCents: number): Promise<ShipQuote[]> {
  const s = site.fulfilment.shipping;
  if (s.pricing === "canadaPost") return canadaPostQuotes(to, grams);

  const rates = await getShippingRates();
  const region = regionFor(to);
  const prices = rates.flatRates[region];
  if (!offered(prices)) throw new ShippingProblem("Sorry, we don’t ship to that address yet. Please choose pickup, or contact us.");
  const free = (region === "ontario" || region === "restOfCanada") && rates.freeInCanadaOverCents != null && subtotalCents >= rates.freeInCanadaOverCents;
  return [{ speed: "standard", service: `${s.carrier} Standard`, cents: free ? 0 : flatPrice(prices, grams), days: null }];
}
