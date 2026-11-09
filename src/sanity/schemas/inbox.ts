import { defineArrayMember, defineField, defineType } from "sanity";

// Vee's inbox: documents created by the website (paid orders, custom-order
// requests, contact messages). Details are read-only; Vee updates the status
// and her own notes as she works through them.

const internalNotes = defineField({ name: "internalNotes", title: "My notes (private)", type: "text", rows: 3 });

export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          // e-Transfer / cash orders start here (Vee, 2026-11-08). Tap "Paid"
          // once the money is in your bank (or cash is collected).
          { title: "⏳ Awaiting payment", value: "awaiting_payment" },
          { title: "💰 Paid", value: "paid" },
          { title: "🆕 New (card, paid)", value: "new" },
          { title: "📦 Packed", value: "packed" },
          { title: "🛍️ Ready for pickup / out for delivery", value: "ready" },
          { title: "✅ Done", value: "done" },
          { title: "↩️ Refunded / cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "new",
      description: "Tip: use the big button at the bottom to move to the next step. It saves for you.",
    }),
    internalNotes,
    defineField({ name: "orderNumber", type: "string", readOnly: true }),
    defineField({ name: "createdAt", title: "Placed", type: "datetime", readOnly: true }),
    defineField({
      name: "customer",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "name", type: "string" }),
        defineField({ name: "email", type: "string" }),
        defineField({ name: "phone", type: "string" }),
      ],
    }),
    defineField({ name: "customerUserId", title: "Customer account", type: "string", readOnly: true, hidden: ({ value }) => !value }),
    defineField({
      name: "paymentMethod",
      title: "Payment",
      type: "string",
      readOnly: true,
      options: { list: [{ title: "Interac e-Transfer", value: "etransfer" }, { title: "Cash at pickup", value: "cash" }, { title: "Card (Stripe)", value: "card" }] },
      hidden: ({ value }) => !value,
    }),
    defineField({ name: "fulfilment", title: "Pickup or delivery", type: "string", readOnly: true }),
    defineField({ name: "deliveryZone", title: "Delivery area", type: "string", readOnly: true, hidden: ({ value }) => !value }),
    defineField({ name: "shippingAddress", title: "Delivery address", type: "text", rows: 3, readOnly: true }),
    defineField({ name: "customerNotes", title: "Customer’s notes", type: "text", rows: 3, readOnly: true, hidden: ({ value }) => !value }),
    defineField({
      name: "items",
      type: "array",
      readOnly: true,
      of: [
        defineArrayMember({
          type: "object",
          name: "orderItem",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({ name: "quantity", type: "number" }),
            defineField({ name: "unitPrice", title: "Unit price ($)", type: "number" }),
            defineField({ name: "lineTotal", title: "Line total ($)", type: "number" }),
            // Links back to the catalogue so customers can "Order again" from their account.
            defineField({ name: "productId", type: "string", hidden: true }),
            defineField({ name: "sizeId", type: "string", hidden: true }),
            defineField({ name: "candyIds", type: "array", of: [defineArrayMember({ type: "string" })], hidden: true }),
          ],
          preview: {
            select: { name: "name", q: "quantity", t: "lineTotal" },
            prepare: ({ name, q, t }) => ({ title: `${q} × ${name}`, subtitle: t != null ? `$${Number(t).toFixed(2)}` : "" }),
          },
        }),
      ],
    }),
    defineField({ name: "subtotal", title: "Subtotal ($)", type: "number", readOnly: true }),
    defineField({ name: "discount", title: "Discount ($)", type: "number", readOnly: true, hidden: ({ value }) => !value }),
    defineField({ name: "discountCode", title: "Discount code", type: "string", readOnly: true, hidden: ({ value }) => !value }),
    defineField({ name: "deliveryFee", title: "Delivery fee ($)", type: "number", readOnly: true, hidden: ({ value }) => value == null }),
    defineField({ name: "tax", title: "Tax ($)", type: "number", readOnly: true }),
    defineField({ name: "total", title: "Total ($)", type: "number", readOnly: true }),
    defineField({ name: "stripeSessionId", title: "Stripe reference", type: "string", readOnly: true, hidden: ({ value }) => !value }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { name: "customer.name", total: "total", status: "status", createdAt: "createdAt", number: "orderNumber", pay: "paymentMethod", how: "fulfilment" },
    prepare: ({ name, total, status, createdAt, number, pay, how }) => ({
      title: `${statusEmoji(status)} ${name ?? "Customer"} · $${Number(total ?? 0).toFixed(2)}`,
      subtitle: [
        number,
        pay === "cash" ? "cash" : pay === "etransfer" ? "e-Transfer" : "",
        how === "delivery" ? "delivery" : how === "pickup" ? "pickup" : "",
        createdAt ? new Date(createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "",
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

export const customEnquiry = defineType({
  name: "customEnquiry",
  title: "Custom order request",
  type: "document",
  fields: [
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "🆕 New", value: "new" },
          { title: "💬 Quoted / talking", value: "quoted" },
          { title: "✅ Booked", value: "booked" },
          { title: "✖️ Not going ahead", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "new",
      description: "Tip: use the big button at the bottom to move to the next step. It saves for you.",
    }),
    internalNotes,
    ...[
      ["createdAt", "Received", "datetime"],
      ["source", "Sent from", "string"],
      ["name", "Name", "string"],
      ["email", "Email", "string"],
      ["phone", "Phone", "string"],
      ["occasion", "Occasion", "string"],
      ["eventDate", "Event date", "date"],
      ["quantity", "Quantity", "number"],
      ["size", "Bag size", "string"],
      ["theme", "Colours / theme", "string"],
      ["mix", "Candy mix", "string"],
      ["allergens", "Ingredient / allergen notes", "text"],
      ["label", "Label wording", "string"],
      ["packaging", "Packaging extras", "string"],
      ["budget", "Budget", "string"],
      ["fulfilment", "Pickup or delivery", "string"],
      ["area", "Town / city", "string"],
      ["notes", "Anything else", "text"],
    ].map(([name, title, type]) => defineField({ name, title, type, readOnly: true })),
    defineField({
      name: "photos",
      title: "Inspiration photos",
      type: "array",
      of: [defineArrayMember({ type: "image" })],
      readOnly: true,
      hidden: ({ value }) => !value?.length,
    }),
    defineField({ name: "userId", title: "Customer account", type: "string", readOnly: true, hidden: ({ value }) => !value }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", occasion: "occasion", date: "eventDate", qty: "quantity", status: "status" },
    prepare: ({ name, occasion, date, qty, status }) => ({
      title: `${statusEmoji(status)} ${name} · ${occasion}`,
      subtitle: `${qty} bags · event ${date}`,
    }),
  },
});

// Saved favourites for a logged-in customer (Clerk user id). Written by the
// website only; not listed in the Studio sidebar.
export const customerFavourites = defineType({
  name: "customerFavourites",
  title: "Customer favourites",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "userId", type: "string" }),
    defineField({ name: "productIds", type: "array", of: [defineArrayMember({ type: "string" })] }),
  ],
});

// Saved delivery addresses for a logged-in customer (Clerk user id). Written by
// the website only; not listed in the Studio sidebar.
export const customerAddresses = defineType({
  name: "customerAddresses",
  title: "Customer addresses",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "userId", type: "string" }),
    defineField({
      name: "addresses",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "savedAddress",
          fields: [
            ...["label", "name", "phone", "line1", "line2", "city", "region", "postalCode", "country"].map((name) =>
              defineField({ name, type: "string" }),
            ),
            defineField({ name: "isDefault", type: "boolean" }),
          ],
        }),
      ],
    }),
  ],
});

export const contactMessage = defineType({
  name: "contactMessage",
  title: "Message",
  type: "document",
  fields: [
    defineField({ name: "handled", title: "Replied", type: "boolean", initialValue: false }),
    defineField({ name: "createdAt", title: "Received", type: "datetime", readOnly: true }),
    defineField({ name: "name", type: "string", readOnly: true }),
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "message", type: "text", readOnly: true }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", message: "message", handled: "handled" },
    prepare: ({ name, message, handled }) => ({ title: `${handled ? "✅" : "🆕"} ${name}`, subtitle: message }),
  },
});

function statusEmoji(status?: string) {
  return (
    { new: "🆕", awaiting_payment: "⏳", paid: "💰", packed: "📦", ready: "🛍️", done: "✅", cancelled: "↩️", quoted: "💬", booked: "✅", closed: "✖️" }[status ?? "new"] ??
    "🆕"
  );
}
