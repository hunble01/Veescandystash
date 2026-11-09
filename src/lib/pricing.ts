import { site } from "@/config/site";
import { getOrders, type Customer } from "@/lib/account";
import { getCandies, getProducts } from "@/lib/catalog";
import { describePicks } from "@/lib/format";
import { MAX_PICKS, MAX_QTY } from "@/lib/limits";

// Server-only. Turns what the browser sent (ids and quantities only) into
// priced order lines. Every name and price is looked up here, so an edited
// cart can't change what the customer pays. Shared by the e-Transfer/cash
// order form and the Stripe checkout.

export type IncomingLine = { productId: unknown; sizeId: unknown; candyIds?: unknown; qty: unknown };

export type PricedLine = {
  name: string;
  unitCents: number;
  qty: number;
  productId: string;
  sizeId: string;
  candyIds?: string[];
};

export class OrderProblem extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function priceLines(lines: unknown): Promise<PricedLine[]> {
  if (!Array.isArray(lines) || lines.length === 0) throw new OrderProblem("Your cart is empty.");
  if (lines.length > 50) throw new OrderProblem("Your cart has too many lines. Please contact us for big orders.");

  const [products, candies] = await Promise.all([getProducts(), getCandies()]);
  const priced: PricedLine[] = [];

  for (const line of lines as IncomingLine[]) {
    const product = products.find((p) => p.id === line?.productId);
    const size = product?.sizes.find((s) => s.id === line.sizeId && s.active);
    const qty = Number(line?.qty);
    if (!product || !size) throw new OrderProblem("Something in your cart is no longer available. Please remove it and try again.", 409);
    if (product.stockStatus === "sold_out") throw new OrderProblem(`${product.name} is sold out.`, 409);
    if (size.priceCents == null) throw new OrderProblem(`${product.name} (${size.label}) isn’t for sale yet.`, 409);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new OrderProblem("Please check the quantities in your cart.");

    // Builder bags: every pick must be a real, in-stock candy within the size's
    // limit. A candy can fill several picks, so repeats count toward the limit.
    let name = `${product.name} (${size.label})`;
    let unitCents = size.priceCents;
    let candyIds: string[] | undefined;
    if (product.type === "builder") {
      const ids: unknown[] = Array.isArray(line.candyIds) ? line.candyIds : [];
      const picked = ids.map((id) => candies.find((c) => c.id === id));
      if (picked.length === 0) throw new OrderProblem(`Please pick at least one candy for your ${product.name}.`);
      if (picked.some((c) => !c || c.inStock === false)) throw new OrderProblem("A candy in your stash is no longer available. Please rebuild it and try again.", 409);
      const limit = size.pickAllowance ?? MAX_PICKS;
      if (picked.length > limit) throw new OrderProblem(`The ${size.label} bag holds up to ${limit} candies.`);
      name += `: ${describePicks(picked.map((c) => c!.name))}`;
      unitCents += picked.reduce((n, c) => n + (c!.extraChargeCents ?? 0), 0);
      candyIds = picked.map((c) => c!.id);
    }
    priced.push({ name, unitCents, qty, productId: product.id, sizeId: size.id, ...(candyIds ? { candyIds } : {}) });
  }
  return priced;
}

// Welcome code (Vee, 2026-11-05): emailed to new accounts; takes
// site.welcomeDiscountPercent off the FIRST order. Returns the percent, or 0
// when no code was typed. Throws a friendly message when it can't be used.
export async function welcomePercentFor(code: string, customer: Customer | null): Promise<number> {
  if (!code) return 0;
  const percent = site.welcomeDiscountPercent;
  if (!percent || code.toUpperCase() !== site.welcomeCode.toUpperCase()) throw new OrderProblem("That code isn’t valid. Please check it and try again.");
  if (!customer) throw new OrderProblem("Please log in to your account to use this code.", 401);
  if ((await getOrders(customer)).length > 0) throw new OrderProblem("This code is for your first order only.");
  return percent;
}

// Delivery fee for a zone, after the free-delivery threshold. null = unknown zone.
export function deliveryFeeCents(zoneId: string, subtotalAfterDiscountCents: number): number | null {
  const zone = site.fulfilment.deliveryZones.find((z) => z.id === zoneId);
  if (!zone) return null;
  const freeOver = site.fulfilment.freeDeliveryOverCents;
  return freeOver != null && subtotalAfterDiscountCents >= freeOver ? 0 : zone.feeCents;
}
