import "server-only";
import { site } from "@/config/site";

// Live Canada Post shipping prices (Vee, 2026-11-09): every customer gets the
// real price for their address, from Vee's postal code in Maple. Uses Canada
// Post's "Get Rates" web service with the retail ("counter") price, which
// needs Developer Program keys but no contract.
//   CANADA_POST_USERNAME / CANADA_POST_PASSWORD  API key (user:password)
//   CANADA_POST_ORIGIN_POSTAL_CODE               Vee's postal code (private)
//   CANADA_POST_SANDBOX=1                        use the test server + test keys

export type ShipSpeed = "standard" | "express";
export type ShipQuote = { speed: ShipSpeed; service: string; cents: number; days: number | null };
export type ShipAddress = { country: string; postalCode: string };

// Which Canada Post service is "Standard" and which is "Express", by where
// it's going. The first one Canada Post offers for the parcel is used.
const SERVICES: Record<"CA" | "US" | "INTL", Record<ShipSpeed, string[]>> = {
  CA: { standard: ["DOM.RP", "DOM.EP"], express: ["DOM.XP", "DOM.PC"] },
  US: { standard: ["USA.TP", "USA.EP"], express: ["USA.XP", "USA.PW.PARCEL"] },
  INTL: { standard: ["INT.TP", "INT.IP.SURF", "INT.IP.AIR"], express: ["INT.XP", "INT.PW.PARCEL"] },
};

export function canadaPostReady() {
  return Boolean(process.env.CANADA_POST_USERNAME && process.env.CANADA_POST_PASSWORD && process.env.CANADA_POST_ORIGIN_POSTAL_CODE);
}

export class ShippingProblem extends Error {}

const clean = (s: string) => s.replace(/\s+/g, "").toUpperCase();
const esc = (s: string) => s.replace(/[<>&"']/g, "");

function box(grams: number) {
  const boxes = site.fulfilment.shipping.boxes;
  return boxes.find((b) => grams <= b.upToGrams) ?? boxes[boxes.length - 1];
}

function destinationXml({ country, postalCode }: ShipAddress) {
  const pc = esc(clean(postalCode));
  if (country === "CA") return `<domestic><postal-code>${pc}</postal-code></domestic>`;
  if (country === "US") return `<united-states><zip-code>${esc(postalCode.trim().slice(0, 5))}</zip-code></united-states>`;
  return `<international><country-code>${esc(country)}</country-code>${pc ? `<postal-code>${pc}</postal-code>` : ""}</international>`;
}

/** Standard and Express prices for a parcel of `grams` to `to`. */
export async function shippingQuotes(to: ShipAddress, grams: number): Promise<ShipQuote[]> {
  if (!canadaPostReady()) throw new ShippingProblem("Shipping prices aren’t available right now. Please choose pickup, or contact us.");
  const user = process.env.CANADA_POST_USERNAME!;
  const pass = process.env.CANADA_POST_PASSWORD!;
  const host = process.env.CANADA_POST_SANDBOX === "1" ? "ct.soa-gw.canadapost.ca" : "soa-gw.canadapost.ca";
  const b = box(grams);
  const kg = Math.max(0.1, grams / 1000).toFixed(3);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
  <quote-type>counter</quote-type>
  <parcel-characteristics>
    <weight>${kg}</weight>
    <dimensions><length>${b.lengthCm}</length><width>${b.widthCm}</width><height>${b.heightCm}</height></dimensions>
  </parcel-characteristics>
  <origin-postal-code>${esc(clean(process.env.CANADA_POST_ORIGIN_POSTAL_CODE!))}</origin-postal-code>
  <destination>${destinationXml(to)}</destination>
</mailing-scenario>`;

  let xml: string;
  try {
    const res = await fetch(`https://${host}/rs/ship/price`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
        Accept: "application/vnd.cpc.ship.rate-v4+xml",
        "Content-Type": "application/vnd.cpc.ship.rate-v4+xml",
        "Accept-Language": "en-CA",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    xml = await res.text();
    if (!res.ok) {
      console.error("Canada Post rates failed:", res.status, xml.slice(0, 500));
      throw new ShippingProblem(
        res.status >= 500 || res.status === 401
          ? "We couldn’t get shipping prices just now. Please try again in a moment."
          : "Canada Post couldn’t find a price for that address. Please check the postal code and country.",
      );
    }
  } catch (e) {
    if (e instanceof ShippingProblem) throw e;
    console.error("Canada Post rates error:", e);
    throw new ShippingProblem("We couldn’t get shipping prices just now. Please try again in a moment.");
  }

  const offered = [...xml.matchAll(/<price-quote>([\s\S]*?)<\/price-quote>/g)].map(([, q]) => ({
    code: /<service-code>([^<]+)<\/service-code>/.exec(q)?.[1] ?? "",
    name: /<service-name>([^<]+)<\/service-name>/.exec(q)?.[1] ?? "",
    cents: Math.round(Number(/<due>([^<]+)<\/due>/.exec(q)?.[1]) * 100),
    days: Number(/<expected-transit-time>([^<]+)<\/expected-transit-time>/.exec(q)?.[1]) || null,
  }));
  const region = to.country === "CA" ? "CA" : to.country === "US" ? "US" : "INTL";
  const quotes: ShipQuote[] = [];
  for (const speed of ["standard", "express"] as const) {
    const pick = SERVICES[region][speed].map((c) => offered.find((o) => o.code === c)).find((o) => o && o.cents > 0);
    if (pick) quotes.push({ speed, service: `${site.fulfilment.shipping.carrier} ${pick.name}`, cents: pick.cents, days: pick.days });
  }
  if (quotes.length === 0) throw new ShippingProblem("Sorry, Canada Post can’t ship this order to that address. Please choose pickup, or contact us.");
  return quotes;
}
