import type Stripe from "stripe";
import { site } from "@/config/site";
import { getCustomer } from "@/lib/account";
import { OrderProblem, priceLines, welcomePercentFor, type PricedLine } from "@/lib/pricing";
import { checkoutBlockers } from "@/lib/readiness";
import { stripe } from "@/lib/stripe";

// Turns a cart into a Stripe Checkout session. The browser only sends product
// ids, size ids, candy ids and quantities: every name and price is looked up here, so an
// edited cart can't change what the customer is charged.

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(req: Request) {
  if (!stripe || site.payments.mode !== "stripe" || checkoutBlockers().length) return fail("Online ordering isn’t open yet.", 503);

  let body: { lines?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.");
  }
  const code = typeof body?.code === "string" ? body.code.trim().slice(0, 40) : "";

  // Logged-in customers: email filled in for them, and the order is tied to
  // their account. Guests check out exactly as before.
  const customer = await getCustomer();
  let priced: PricedLine[];
  let percent: number;
  try {
    priced = await priceLines(body?.lines);
    percent = await welcomePercentFor(code, customer);
  } catch (e) {
    if (e instanceof OrderProblem) return fail(e.message, e.status);
    throw e;
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priced.map((l) => ({
    quantity: l.qty,
    price_data: {
      currency: "cad",
      unit_amount: l.unitCents,
      product_data: {
        name: l.name,
        // Saved on the order so customers can "Order again" from their account.
        metadata: { productId: l.productId, sizeId: l.sizeId, ...(l.candyIds ? { candyIds: l.candyIds.join(",").slice(0, 490) } : {}) },
      },
    },
    // Optional HST rate created in the Stripe dashboard (Products → Tax rates).
    ...(process.env.STRIPE_TAX_RATE_ID ? { tax_rates: [process.env.STRIPE_TAX_RATE_ID] } : {}),
  }));

  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
  if (percent) {
    const couponId = `WELCOME${percent}`;
    try {
      await stripe.coupons.retrieve(couponId);
    } catch {
      await stripe.coupons.create({ id: couponId, percent_off: percent, duration: "once", name: `Welcome: ${percent}% off your first order` });
    }
    discounts = [{ coupon: couponId }];
  }

  const methods = site.fulfilment.methods;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    ...(discounts.length ? { discounts } : {}),
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
