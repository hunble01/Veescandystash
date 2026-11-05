import type Stripe from "stripe";
import { notifyOwner } from "@/lib/notify";
import { stripe } from "@/lib/stripe";
import { writeClient } from "@/sanity/client";

// Stripe calls this after a customer pays. We record the order in Sanity
// (Vee's order inbox) and email her. Stripe retries until it gets a 2xx, and
// the order id is derived from the session id, so retries never duplicate.

const dollars = (cents: number | null | undefined) => Math.round(cents ?? 0) / 100;

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return new Response("Webhook not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status === "paid") await recordOrder(session);
  }
  return new Response("ok");
}

async function recordOrder(session: Stripe.Checkout.Session) {
  const items = await stripe!.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ["data.price.product"] });
  const customer = session.customer_details;
  const shipping = session.collected_information?.shipping_details;
  const fulfilment =
    session.custom_fields?.find((f) => f.key === "fulfilment")?.dropdown?.value || session.metadata?.fulfilment || "";
  const orderNumber = `VCS-${session.id.slice(-8).toUpperCase()}`;
  const address = shipping
    ? [shipping.name, shipping.address.line1, shipping.address.line2, `${shipping.address.city ?? ""} ${shipping.address.state ?? ""} ${shipping.address.postal_code ?? ""}`.trim()]
        .filter(Boolean)
        .join("\n")
    : "";

  const order = {
    _id: `orders.${session.id}`, // dotted id: kept off Sanity's public API
    _type: "order",
    status: "new",
    orderNumber,
    createdAt: new Date(session.created * 1000).toISOString(),
    customer: { name: customer?.name ?? "", email: customer?.email ?? "", phone: customer?.phone ?? "" },
    customerUserId: session.metadata?.customerUserId ?? "",
    fulfilment,
    shippingAddress: address,
    items: items.data.map((li) => ({
      ...catalogueLink(li),
      _key: li.id,
      _type: "orderItem",
      name: li.description,
      quantity: li.quantity ?? 1,
      unitPrice: dollars(li.price?.unit_amount),
      lineTotal: dollars(li.amount_total),
    })),
    subtotal: dollars(session.amount_subtotal),
    tax: dollars(session.total_details?.amount_tax),
    total: dollars(session.amount_total),
    stripeSessionId: session.id,
  };

  // Already recorded (a Stripe retry)? Then it's handled, including the email.
  // If saving fails we throw, Stripe gets a 500 and tries again later.
  if (writeClient) {
    if (await writeClient.getDocument(order._id)) return;
    await writeClient.createIfNotExists(order);
  }

  await notifyOwner(
    `🛍️ New order ${orderNumber}: $${order.total.toFixed(2)} from ${order.customer.name}`,
    [
      ["Order", orderNumber],
      ["Customer", order.customer.name],
      ["Email", order.customer.email],
      ["Phone", order.customer.phone],
      ["Pickup or delivery", fulfilment],
      ["Delivery address", address],
      ["Items", order.items.map((i) => `${i.quantity} × ${i.name} ($${i.lineTotal.toFixed(2)})`).join("\n")],
      ["Tax", `$${order.tax.toFixed(2)}`],
      ["Total paid", `$${order.total.toFixed(2)}`],
    ],
    order.customer.email || undefined,
  );
}

// Product, size and builder candy ids from the line item's product metadata
// (set in /api/checkout), used for "Order again" in the customer's account.
function catalogueLink(li: Stripe.LineItem) {
  const product = li.price?.product;
  const meta = product && typeof product === "object" && !("deleted" in product && product.deleted) ? product.metadata : {};
  return {
    ...(meta.productId ? { productId: meta.productId } : {}),
    ...(meta.sizeId ? { sizeId: meta.sizeId } : {}),
    ...(meta.candyIds ? { candyIds: meta.candyIds.split(",").filter(Boolean) } : {}),
  };
}
