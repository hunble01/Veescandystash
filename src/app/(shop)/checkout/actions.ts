"use server";

import { randomInt } from "node:crypto";
import { site } from "@/config/site";
import { getCustomer } from "@/lib/account";
import { escapeHtml, notifyOwner, sendOrderInstructions } from "@/lib/notify";
import { OrderProblem, deliveryFeeCents, priceLines, welcomePercentFor } from "@/lib/pricing";
import { checkoutBlockers } from "@/lib/readiness";
import { writeClient } from "@/sanity/client";

// e-Transfer / cash orders (Vee, 2026-11-08). No money is taken online: the
// order is saved in the Studio as "Awaiting payment", Vee is emailed, and the
// customer gets the payment instructions on screen (and by email once the
// domain is verified in Resend). Vee marks it paid in the Studio.

export type PlaceOrderInput = {
  lines: unknown;
  code?: string;
  name: string;
  email: string;
  phone: string;
  fulfilment: string; // "pickup" or a delivery zone id
  street?: string;
  city?: string;
  postalCode?: string;
  payment: string; // "etransfer" | "cash"
  notes?: string;
  website?: string; // spam trap
};

export type PlacedOrder = {
  orderNumber: string;
  subtotalCents: number;
  discountCents: number;
  deliveryCents: number;
  totalCents: number;
  payment: "etransfer" | "cash";
  fulfilment: "pickup" | "delivery";
  eTransferEmail: string | null;
  emailed: boolean;
};

export type PlaceOrderResult =
  | { status: "placed"; order: PlacedOrder }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const cad = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

// Short, easy to type in an e-Transfer message: no 0/O or 1/I.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newOrderNumber = () => `VCS-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (site.payments.mode !== "manual" || checkoutBlockers().length) return { status: "error", message: "Online ordering isn’t open yet." };
  if (str(input?.website)) return { status: "error", message: "Something went wrong. Please try again." };

  const v = {
    name: str(input.name, 120),
    email: str(input.email, 200),
    phone: str(input.phone, 40),
    fulfilment: str(input.fulfilment, 40),
    street: str(input.street, 200),
    city: str(input.city, 100),
    postalCode: str(input.postalCode, 10).toUpperCase(),
    payment: str(input.payment, 20),
    notes: str(input.notes, 1000),
    code: str(input.code, 40),
  };

  const zone = site.fulfilment.deliveryZones.find((z) => z.id === v.fulfilment);
  const isPickup = v.fulfilment === "pickup";
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = "Please add your name.";
  if (!v.email) errors.email = "Please add your email.";
  else if (!EMAIL.test(v.email)) errors.email = "That email doesn’t look quite right.";
  if (v.phone.replace(/\D/g, "").length < 10) errors.phone = "Please add a phone number so Vee can reach you.";
  if (isPickup ? !site.fulfilment.methods.includes("pickup") : !zone || !site.fulfilment.methods.includes("delivery"))
    errors.fulfilment = "Please choose pickup or a delivery area.";
  if (zone) {
    if (!v.street) errors.street = "Please add your street address.";
    if (!v.city) errors.city = "Please add your town or city.";
    if (!POSTAL.test(v.postalCode)) errors.postalCode = "Please add a Canadian postal code, like L4L 1A1.";
  }
  const cashOk = site.payments.cash && isPickup;
  if (v.payment !== "etransfer" && !(v.payment === "cash" && cashOk))
    errors.payment = cashOk ? "Please choose e-Transfer or cash." : "Delivery orders are paid by e-Transfer.";
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const customer = await getCustomer();
  let priced;
  try {
    priced = await priceLines(input.lines);
  } catch (e) {
    if (e instanceof OrderProblem) return { status: "error", message: e.message };
    throw e;
  }
  let percent;
  try {
    percent = await welcomePercentFor(v.code, customer);
  } catch (e) {
    if (e instanceof OrderProblem) return { status: "invalid", errors: { code: e.message } };
    throw e;
  }

  const subtotalCents = priced.reduce((n, l) => n + l.unitCents * l.qty, 0);
  const discountCents = Math.round((subtotalCents * percent) / 100);
  const deliveryCents = zone ? deliveryFeeCents(zone.id, subtotalCents - discountCents) ?? 0 : 0;
  const totalCents = subtotalCents - discountCents + deliveryCents;
  const payment = v.payment as "etransfer" | "cash";
  const address = zone ? [v.street, `${v.city}, ON ${v.postalCode}`].join("\n") : "";
  const fulfilmentText = isPickup ? `Pickup in ${site.fulfilment.pickupArea ?? "Vaughan"}` : `Delivery: ${zone!.label}`;
  const paymentText = payment === "cash" ? "Cash at pickup" : `e-Transfer to ${site.payments.eTransferEmail}`;

  // Save to Vee's inbox. Retry once on the (very unlikely) chance the number is taken.
  let orderNumber = newOrderNumber();
  const doc = () => ({
    _id: `orders.manual-${orderNumber}`, // dotted id: kept off Sanity's public API
    _type: "order",
    status: "awaiting_payment",
    orderNumber,
    createdAt: new Date().toISOString(),
    customer: { name: v.name, email: v.email, phone: v.phone },
    customerUserId: customer?.id ?? "",
    fulfilment: isPickup ? "pickup" : "delivery",
    deliveryZone: zone?.label ?? "",
    shippingAddress: address,
    paymentMethod: payment,
    customerNotes: v.notes,
    items: priced.map((l, i) => ({
      _key: `i${i}`,
      _type: "orderItem",
      name: l.name,
      quantity: l.qty,
      unitPrice: l.unitCents / 100,
      lineTotal: (l.unitCents * l.qty) / 100,
      productId: l.productId,
      sizeId: l.sizeId,
      ...(l.candyIds ? { candyIds: l.candyIds } : {}),
    })),
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    discountCode: percent ? v.code.toUpperCase() : "",
    deliveryFee: deliveryCents / 100,
    tax: 0,
    total: totalCents / 100,
  });

  let saved = false;
  if (writeClient) {
    try {
      await writeClient.create(doc());
      saved = true;
    } catch {
      orderNumber = newOrderNumber();
      try {
        await writeClient.create(doc());
        saved = true;
      } catch (e) {
        console.error("Saving order failed:", e);
      }
    }
  }

  const itemLines = priced.map((l) => `${l.qty} × ${l.name} (${cad(l.unitCents * l.qty)})`);
  const ownerEmailed = await notifyOwner(
    `🛍️ New order ${orderNumber}: ${cad(totalCents)} from ${v.name} (${payment === "cash" ? "cash" : "e-Transfer"}, waiting for payment)`,
    [
      ["Order", orderNumber],
      ["Payment", `${paymentText}: NOT PAID YET. Check your bank before packing.`],
      ["Customer", v.name],
      ["Email", v.email],
      ["Phone", v.phone],
      ["Pickup or delivery", fulfilmentText],
      ["Delivery address", address],
      ["Items", itemLines.join("\n")],
      ["Subtotal", cad(subtotalCents)],
      ["Discount", discountCents ? `−${cad(discountCents)} (${v.code.toUpperCase()})` : ""],
      ["Delivery", zone ? (deliveryCents ? cad(deliveryCents) : "Free") : ""],
      ["Total to collect", cad(totalCents)],
      ["Customer notes", v.notes],
    ],
    v.email,
  ).catch((e) => {
    console.error("Order email to Vee failed:", e);
    return false;
  });

  if (!saved && !ownerEmailed) return { status: "error", message: "Sorry, we couldn’t send your order. Please try again, or email us." };

  const etEmail = site.payments.eTransferEmail;
  const paymentHtml =
    payment === "cash"
      ? `<p><b>How to pay:</b> bring <b>${cad(totalCents)}</b> in cash when you pick up. Vee will email you when it’s ready, with the pickup address and time.</p>`
      : `<p><b>How to pay:</b> send an Interac e-Transfer of <b>${cad(totalCents)}</b> to <b>${escapeHtml(etEmail ?? "")}</b> and put <b>${orderNumber}</b> in the message. We start packing once it arrives.</p>`;
  const emailed = await sendOrderInstructions(v.email, {
    firstName: v.name.split(" ")[0],
    orderNumber,
    total: cad(totalCents),
    items: itemLines,
    paymentHtml,
    fulfilment: isPickup
      ? `Pickup in ${site.fulfilment.pickupArea ?? "Vaughan"}. Vee will email you the address and time when it’s ready.`
      : `Delivery to: ${address.replace("\n", ", ")}.`,
  }).catch(() => false);

  return {
    status: "placed",
    order: {
      orderNumber,
      subtotalCents,
      discountCents,
      deliveryCents,
      totalCents,
      payment,
      fulfilment: isPickup ? "pickup" : "delivery",
      eTransferEmail: etEmail,
      emailed,
    },
  };
}
