import "server-only";
import { site } from "@/config/site";
import { canadaPostReady, ShippingProblem, shippingQuotes as canadaPostQuotes, type ShipAddress, type ShipQuote } from "@/lib/canadaPost";

// One place for shipping prices (Vee, 2026-11-10). Flat rates from
// site.fulfilment.shipping.flatRates, or live Canada Post prices when
// shipping.pricing is "canadaPost".

export { ShippingProblem, type ShipQuote };

type Region = keyof typeof site.fulfilment.shipping.flatRates;

function regionFor({ country, postalCode }: ShipAddress): Region {
  if (country === "CA") return /^[KLMNP]/i.test(postalCode.trim()) ? "ontario" : "restOfCanada";
  return country === "US" ? "usa" : "world";
}

const offered = (r: { standard: number | null; express: number | null }) => r.standard != null || r.express != null;

/** Which countries can be shipped to: "all", or a short list of codes. */
export function shippingCountries(): "all" | string[] {
  const s = site.fulfilment.shipping;
  if (s.pricing === "canadaPost") return "all";
  const r = s.flatRates;
  if (offered(r.world)) return "all";
  return [...(offered(r.ontario) || offered(r.restOfCanada) ? ["CA"] : []), ...(offered(r.usa) ? ["US"] : [])];
}

/** Short line for the checkout: where shipping goes. */
export function shippingAreaText() {
  const s = site.fulfilment.shipping;
  if (s.pricing === "canadaPost") return "Anywhere in Canada or around the world.";
  const r = s.flatRates;
  const canada = offered(r.ontario) && offered(r.restOfCanada) ? "Canada" : offered(r.ontario) ? "Ontario" : offered(r.restOfCanada) ? "Canada (outside Ontario)" : null;
  const places = [canada, offered(r.usa) ? "the USA" : null, offered(r.world) ? "the rest of the world" : null].filter(Boolean) as string[];
  if (!places.length) return "";
  const list = places.length === 1 ? places[0] : `${places.slice(0, -1).join(", ")} and ${places[places.length - 1]}`;
  return `We ship to ${list}.`;
}

/** True when checkout can offer shipping. */
export function shippingReady() {
  const s = site.fulfilment.shipping;
  if (s.pricing === "canadaPost") return canadaPostReady();
  return Object.values(s.flatRates).some(offered);
}

/** Standard / Express prices for this address. */
export async function shippingQuotes(to: ShipAddress, grams: number, subtotalCents: number): Promise<ShipQuote[]> {
  const s = site.fulfilment.shipping;
  if (s.pricing === "canadaPost") return canadaPostQuotes(to, grams);

  const rate = s.flatRates[regionFor(to)];
  const free = s.freeStandardOverCents != null && subtotalCents >= s.freeStandardOverCents;
  const quotes: ShipQuote[] = [];
  if (rate.standard != null) quotes.push({ speed: "standard", service: `${s.carrier} Standard`, cents: free ? 0 : rate.standard, days: null });
  if (rate.express != null) quotes.push({ speed: "express", service: `${s.carrier} Express`, cents: rate.express, days: null });
  if (quotes.length === 0) throw new ShippingProblem("Sorry, we don’t ship to that address yet. Please choose pickup, or contact us.");
  return quotes;
}
