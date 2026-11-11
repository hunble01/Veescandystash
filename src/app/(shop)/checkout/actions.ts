"use server";

import { randomInt } from "node:crypto";
import { site } from "@/config/site";
import { getAddresses, getCustomer } from "@/lib/account";
import { escapeHtml, notifyOwner, sendOrderInstructions } from "@/lib/notify";
import { POSTAL_RULES } from "@/data/countries";
import { ShippingProblem, shippingQuotes, type ShipQuote } from "@/lib/shipping";
import { OrderProblem, parcelGrams, priceLines, welcomePercentFor } from "@/lib/pricing";
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
  fulfilment: string; // "pickup", or Canada Post "standard" / "express"
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string; // ISO code, e.g. "CA"
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
  payWithinHours: number | null;
  emailed: boolean;
};

export type PlaceOrderResult =
  | { status: "placed"; order: PlacedOrder }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    province: str(input.province, 60),
    postalCode: str(input.postalCode, 12).toUpperCase(),
    country: str(input.country, 2).toUpperCase() || "CA",
    payment: str(input.payment, 20),
    notes: str(input.notes, 1000),
    code: str(input.code, 40),
  };

  const isPickup = v.fulfilment === "pickup";
  const isShipping = v.fulfilment === "standard" || v.fulfilment === "express";
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = "Please add your name.";
  if (!v.email) errors.email = "Please add your email.";
  else if (!EMAIL.test(v.email)) errors.email = "That email doesn’t look quite right.";
  if (v.phone.replace(/\D/g, "").length < 10) errors.phone = "Please add a phone number so Vee can reach you.";
  if (isPickup ? !site.fulfilment.methods.includes("pickup") : !isShipping || !site.fulfilment.methods.includes("delivery"))
    errors.fulfilment = "Please choose pickup or a shipping option.";
  if (isShipping) Object.assign(errors, addressErrors(v));
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
  // Shipping: flat rate or live Canada Post price (src/lib/shipping.ts).
  let ship: ShipQuote | null = null;
  if (isShipping) {
    try {
      const quotes = await shippingQuotes({ country: v.country, postalCode: v.postalCode }, parcelGrams(priced), subtotalCents);
      ship = quotes.find((q) => q.speed === v.fulfilment) ?? null;
    } catch (e) {
      if (e instanceof ShippingProblem) return { status: "error", message: e.message };
      throw e;
    }
    if (!ship) return { status: "invalid", errors: { fulfilment: "That shipping option isn’t available for this address. Please choose another." } };
  }
  const deliveryCents = ship?.cents ?? 0;
  const totalCents = subtotalCents - discountCents + deliveryCents;
  const payment = v.payment as "etransfer" | "cash";
  const address = isShipping ? formatAddress(v) : "";
  const fulfilmentText = isPickup ? `Pickup in ${site.fulfilment.pickupArea ?? "Vaughan"}` : `Shipping: ${ship!.service}`;
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
    deliveryZone: ship?.service ?? "",
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
      ["Pickup or shipping", fulfilmentText],
      ["Ship to", address],
      ["Items", itemLines.join("\n")],
      ["Subtotal", cad(subtotalCents)],
      ["Discount", discountCents ? `−${cad(discountCents)} (${v.code.toUpperCase()})` : ""],
      ["Shipping", ship ? cad(deliveryCents) : ""],
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
      : `<p><b>How to pay:</b> send an Interac e-Transfer of <b>${cad(totalCents)}</b> to <b>${escapeHtml(etEmail ?? "")}</b> and put <b>${orderNumber}</b> in the message. We start packing once it arrives.${site.payments.payWithinHours ? ` Please pay within ${site.payments.payWithinHours} hours, or your order will be cancelled.` : ""}</p>`;
  const emailed = await sendOrderInstructions(v.email, {
    firstName: v.name.split(" ")[0],
    orderNumber,
    total: cad(totalCents),
    items: itemLines,
    paymentHtml,
    fulfilment: isPickup
      ? `Pickup in ${site.fulfilment.pickupArea ?? "Vaughan"}. Vee will email you the address and time when it’s ready.`
      : `Shipping with ${ship!.service} to: ${address.replace(/\n/g, ", ")}.`,
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
      payWithinHours: site.payments.payWithinHours,
      emailed,
    },
  };
}

// Logged-in customers: their default saved address and phone, to fill in the
// order form. Guests get null.
export async function myCheckoutDefaults() {
  const customer = await getCustomer();
  if (!customer) return null;
  const addresses = await getAddresses(customer.id).catch(() => []);
  const a = addresses.find((x) => x.isDefault) ?? addresses[0];
  return {
    name: a?.name || customer.name,
    email: customer.email,
    phone: a?.phone ?? "",
    street: a ? [a.line1, a.line2].filter(Boolean).join(", ") : "",
    city: a?.city ?? "",
    postalCode: a?.postalCode ?? "",
  };
}

// Promo code box (bag + checkout, Vee 2026-11-09): checks a code before the
// order is placed so the customer sees the discount. placeOrder checks it
// again, so this is only for showing the result.
export async function checkDiscountCode(code: string): Promise<{ ok: true; percent: number } | { ok: false; message: string }> {
  const c = String(code ?? "").trim().slice(0, 40);
  if (!c) return { ok: false, message: "Type a promo code first." };
  try {
    const percent = await welcomePercentFor(c, await getCustomer());
    return percent ? { ok: true, percent } : { ok: false, message: "That code isn’t valid. Please check it and try again." };
  } catch (e) {
    if (e instanceof OrderProblem) return { ok: false, message: e.message };
    return { ok: false, message: "We couldn’t check that code just now. Please try again." };
  }
}

// Address checks for shipping (Vee, 2026-11-09: Canada Post, worldwide).
function addressErrors(v: { street: string; city: string; province: string; postalCode: string; country: string }) {
  const errors: Record<string, string> = {};
  if (!v.street) errors.street = "Please add your street address.";
  if (!v.city) errors.city = "Please add your town or city.";
  if ((v.country === "CA" || v.country === "US") && !v.province) errors.province = v.country === "US" ? "Please add your state." : "Please add your province.";
  if (!/^[A-Z]{2}$/.test(v.country)) errors.country = "Please choose your country.";
  const rule = POSTAL_RULES[v.country];
  if (rule && !rule.re.test(v.postalCode)) errors.postalCode = `Please add a ${rule.label.toLowerCase()}, like ${rule.example}.`;
  return errors;
}

function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["en-CA"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function formatAddress(v: { street: string; city: string; province: string; postalCode: string; country: string }) {
  return [v.street, [v.city, v.province, v.postalCode].filter(Boolean).join(", "), countryName(v.country)].join("\n");
}

// Shipping prices for the checkout page (Vee, 2026-11-09): the customer's
// cart and address in, Canada Post Standard and Express prices out. The
// price is looked up again when the order is placed.
export async function quoteShipping(input: { lines: unknown; country: string; postalCode: string }): Promise<
  { ok: true; quotes: ShipQuote[] } | { ok: false; message: string }
> {
  if (!site.fulfilment.methods.includes("delivery")) return { ok: false, message: "We’re not shipping orders yet. Please choose pickup." };
  const country = str(input?.country, 2).toUpperCase();
  const postalCode = str(input?.postalCode, 12).toUpperCase();
  const rule = POSTAL_RULES[country];
  if (!/^[A-Z]{2}$/.test(country)) return { ok: false, message: "Please choose your country." };
  if (rule && !rule.re.test(postalCode)) return { ok: false, message: `Please add a ${rule.label.toLowerCase()}, like ${rule.example}.` };
  try {
    const priced = await priceLines(input.lines);
    const subtotalCents = priced.reduce((n, l) => n + l.unitCents * l.qty, 0);
    return { ok: true, quotes: await shippingQuotes({ country, postalCode }, parcelGrams(priced), subtotalCents) };
  } catch (e) {
    if (e instanceof ShippingProblem || e instanceof OrderProblem) return { ok: false, message: e.message };
    console.error("Shipping quote failed:", e);
    return { ok: false, message: "We couldn’t get shipping prices just now. Please try again in a moment." };
  }
}
