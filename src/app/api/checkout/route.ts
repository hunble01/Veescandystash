import type Stripe from "stripe";
import { site } from "@/config/site";
import { getCustomer } from "@/lib/account";
import { getCandies, getProducts } from "@/lib/catalog";
import { describePicks } from "@/lib/format";
import { MAX_PICKS, MAX_QTY } from "@/lib/limits";
import { checkoutBlockers } from "@/lib/readiness";
import { stripe } from "@/lib/stripe";

// Turns a cart into a Stripe Checkout session. The browser only sends product
// ids, size ids, candy ids and quantities: every name and price is looked up here, so an
// edited cart can't change what the customer is charged.

type IncomingLine = { productId: unknown; sizeId: unknown; candyIds?: unknown; qty: unknown };

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(req: Request) {
  if (!stripe || checkoutBlockers().length) return fail("Online ordering isn’t open yet.", 503);

  let lines: IncomingLine[];
  try {
    const body = await req.json();
    lines = Array.isArray(body?.lines) ? body.lines : [];
  } catch {
    return fail("Invalid request.");
  }
  if (lines.length === 0 || lines.length > 50) return fail("Your cart is empty.");

  const [products, candies] = await Promise.all([getProducts(), getCandies()]);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    const size = product?.sizes.find((s) => s.id === line.sizeId && s.active);
    const qty = Number(line.qty);
    if (!product || !size) return fail("Something in your cart is no longer available. Please remove it and try again.", 409);
    if (product.stockStatus === "sold_out") return fail(`${product.name} is sold out.`, 409);
    if (size.priceCents == null) return fail(`${product.name} (${size.label}) isn’t for sale yet.`, 409);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return fail("Please check the quantities in your cart.");

    // Builder bags: every pick must be a real, in-stock candy within the size's
    // limit. A candy can fill several picks, so repeats count toward the limit.
    let name = `${product.name} (${size.label})`;
    let unitAmount = size.priceCents;
    if (product.type === "builder") {
      const ids: unknown[] = Array.isArray(line.candyIds) ? line.candyIds : [];
      const picked = ids.map((id) => candies.find((c) => c.id === id));
      if (picked.length === 0) return fail(`Please pick at least one candy for your ${product.name}.`);
      if (picked.some((c) => !c || c.inStock === false)) return fail("A candy in your stash is no longer available. Please rebuild it and try again.", 409);
      if (picked.length > (size.pickAllowance ?? MAX_PICKS)) return fail(`The ${size.label} bag holds up to ${size.pickAllowance ?? MAX_PICKS} candies.`);
      name += `: ${describePicks(picked.map((c) => c!.name))}`;
      unitAmount += picked.reduce((n, c) => n + (c!.extraChargeCents ?? 0), 0);
    }

    lineItems.push({
      quantity: qty,
      price_data: {
        currency: "cad",
        unit_amount: unitAmount,
        product_data: {
          name,
          // Saved on the order so customers can "Order again" from their account.
          metadata: {
            productId: product.id,
            sizeId: size.id,
            ...(product.type === "builder" && Array.isArray(line.candyIds) ? { candyIds: line.candyIds.join(",").slice(0, 490) } : {}),
          },
        },
      },
      // Optional HST rate created in the Stripe dashboard (Products → Tax rates).
      ...(process.env.STRIPE_TAX_RATE_ID ? { tax_rates: [process.env.STRIPE_TAX_RATE_ID] } : {}),
    });
  }

  // Logged-in customers: email filled in for them, and the order is tied to
  // their account. Guests check out exactly as before.
  const customer = await getCustomer();

  const methods = site.fulfilment.methods;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    phone_number_collection: { enabled: true },
    ...(methods.includes("delivery") ? { shipping_address_collection: { allowed_countries: ["CA"] } } : {}),
    custom_fields:
      methods.length > 1
        ? [
            {
              key: "fulfilment",
              label: { type: "custom", custom: "Pickup or delivery?" },
              type: "dropdown",
              dropdown: { options: methods.map((m) => ({ label: m === "pickup" ? "Pickup" : "Delivery", value: m })) },
            },
          ]
        : [],
    ...(customer?.email ? { customer_email: customer.email } : {}),
    metadata: { fulfilment: methods.length === 1 ? methods[0] : "", customerUserId: customer?.id ?? "" },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return session.url ? Response.json({ url: session.url }) : fail("Couldn’t start checkout.", 502);
}
