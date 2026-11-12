import { defineArrayMember, defineField, defineType } from "sanity";

// Catalogue content Vee edits in the Studio. Field names mirror src/lib/types.ts.
// Prices are entered in dollars (e.g. 12.50) and converted to cents in code.

const accent = defineField({
  name: "accent",
  title: "Card colour",
  type: "string",
  options: { list: ["orange", "pink", "teal"], layout: "radio", direction: "horizontal" },
  initialValue: "orange",
  validation: (r) => r.required(),
});

// Holidays get their own colours on top of the brand ones (Vee, 2026-10-27).
// Ready-made looks shown on each occasion and holiday page, which customers
// can pick in the short order form there.
const themes = defineField({
  name: "themes",
  title: "Themes we offer",
  description: "Each one shows as a card customers can pick, e.g. “Red and green” with “Red and green candy with a holiday message tag”.",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        defineField({ name: "name", type: "string", validation: (r) => r.required() }),
        defineField({ name: "description", type: "text", rows: 2 }),
      ],
      preview: { select: { title: "name", subtitle: "description" } },
    }),
  ],
});

const holidayAccent = defineField({
  ...accent,
  options: { list: ["orange", "pink", "teal", "red", "green", "gold"], layout: "radio", direction: "horizontal" },
  initialValue: "teal",
});

const slug = defineField({
  name: "slug",
  title: "Web address",
  type: "slug",
  options: { source: "name" },
  description: "Click Generate. This becomes part of the page’s link.",
  validation: (r) => r.required(),
});

export const sizeVariant = defineType({
  name: "sizeVariant",
  title: "Size",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Size name", type: "string", description: "e.g. ½ lb, 1 lb, 2 lb, 5 lb", validation: (r) => r.required() }),
    defineField({ name: "price", title: "Price (CAD $)", type: "number", description: "Leave empty to show “Price coming soon”.", validation: (r) => r.min(0).precision(2) }),
    defineField({ name: "weightGrams", title: "Weight (grams)", type: "number", validation: (r) => r.min(0) }),
    defineField({ name: "pickAllowance", title: "Candy picks allowed", type: "number", description: "For Build Your Own bags only. Leave empty to let customers pick as many as they like.", validation: (r) => r.min(0).integer() }),
    defineField({ name: "photo", title: "Bag photo", type: "image", description: "Shown on Build Your Stash so customers can see the bag size.", options: { hotspot: true } }),
    defineField({ name: "active", title: "Available", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "label", price: "price", active: "active", media: "photo" },
    prepare: ({ title, price, active, media }) => ({
      media,
      title: `${title}${active === false ? " (hidden)" : ""}`,
      subtitle: price != null ? `$${Number(price).toFixed(2)}` : "No price yet",
    }),
  },
});

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug,
    defineField({ name: "summary", title: "Short line (for cards)", type: "string", validation: (r) => r.required().max(90) }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Ready-made mix", value: "mix" },
          { title: "Build your own", value: "builder" },
          { title: "Occasion preset", value: "occasion_preset" },
        ],
        layout: "radio",
      },
      initialValue: "mix",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "flavour",
      type: "string",
      options: {
        list: [
          { title: "Sweet", value: "sweet" },
          { title: "Sour", value: "sour" },
          { title: "Sweet + Sour", value: "sweet_sour" },
          { title: "Customer picks", value: "your_pick" },
          { title: "Candy surprise", value: "surprise" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    accent,
    defineField({ name: "sizes", type: "array", of: [defineArrayMember({ type: "sizeVariant" })] }),
    defineField({ name: "photos", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true } })] }),
    defineField({
      name: "stockStatus",
      title: "Stock",
      type: "string",
      options: {
        list: [
          { title: "Don’t show", value: "unknown" },
          { title: "In stock", value: "in_stock" },
          { title: "Almost gone", value: "low_stock" },
          { title: "Sold out", value: "sold_out" },
        ],
        layout: "radio",
      },
      initialValue: "unknown",
    }),
    defineField({ name: "ingredientsAllergens", title: "Ingredients & allergens", type: "text", rows: 4 }),
    defineField({ name: "prepTime", title: "Ready in", type: "string", description: "e.g. 2–3 business days" }),
    defineField({ name: "active", title: "Show on website", type: "boolean", initialValue: true }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number", description: "Lower numbers show first." }),
  ],
  orderings: [{ title: "Sort order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "summary", media: "photos.0" } },
});

export const candyOption = defineType({
  name: "candyOption",
  title: "Candy option",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    // Only Sweet and Sour: they match the builder's filter buttons (Vee, 2026-10-30).
    defineField({ name: "category", type: "string", options: { list: ["sweet", "sour"], layout: "radio" } }),
    defineField({ name: "photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "ingredientsAllergens", title: "Ingredients & allergens", type: "text", rows: 4 }),
    defineField({ name: "inStock", title: "In stock", type: "boolean", initialValue: true }),
    defineField({ name: "vegan", title: "Vegan", type: "boolean", initialValue: false, description: "Shows a 🌱 Vegan badge and puts it in the Vegan section of Build Your Stash. Only tick it if the packet says vegan." }),
    defineField({ name: "extraCharge", title: "Extra charge (CAD $)", type: "number", description: "Added to the bag price when a customer picks this candy. Leave empty for no extra charge.", validation: (r) => r.min(0).precision(2) }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number", description: "Lower numbers show first." }),
  ],
  preview: { select: { title: "name", subtitle: "category", media: "photo" } },
});

export const occasion = defineType({
  name: "occasion",
  title: "Occasion",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug,
    defineField({ name: "shortName", title: "Short name (for tiles)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", type: "string" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "ideas", title: "Ideas we can make", type: "array", of: [defineArrayMember({ type: "string" })] }),
    themes,
    accent,
    defineField({ name: "bannerImage", title: "Banner photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "products", title: "Suggested products", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })] }),
    defineField({ name: "featuredOnHome", title: "Show on home page", type: "boolean", initialValue: false }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
});

export const seasonalCollection = defineType({
  name: "seasonalCollection",
  title: "Holiday collection",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug,
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "ideas", type: "array", of: [defineArrayMember({ type: "string" })] }),
    themes,
    holidayAccent,
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Coming soon", value: "coming_soon" },
          { title: "Available now", value: "available_now" },
          { title: "Closed for the season", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "coming_soon",
    }),
    defineField({ name: "orderCutoff", title: "Order by (shown to customers)", type: "string", description: "e.g. December 15" }),
    defineField({ name: "products", title: "Ready-to-order products", description: "Products with a set price shown on this holiday’s page, e.g. the advent calendar.", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })] }),
    defineField({ name: "active", title: "Show on website", type: "boolean", initialValue: true }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
});

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 4, description: "Leave empty to show “Answer coming soon”." }),
    defineField({
      name: "topic",
      type: "string",
      options: { list: ["Ordering", "Pickup & delivery", "Custom orders", "Candy", "Policies"] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "links",
      title: "Buttons under the answer",
      description: "Tick the pages customers can tap straight to. Email and Call only appear once they're added to the site's contact details.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Shop", value: "shop" },
          { title: "Build Your Stash", value: "build" },
          { title: "Occasions", value: "occasions" },
          { title: "Custom Orders", value: "custom" },
          { title: "Email us", value: "email" },
          { title: "Call us", value: "phone" },
          { title: "Contact page", value: "contact" },
          { title: "Policies page", value: "policies" },
        ],
      },
    }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
});

// Shipping prices Vee can change herself (Vee, 2026-11-11). One page in the
// Studio (document id "shippingPrices"). The website falls back to
// site.fulfilment.shipping.flatRates when this page is empty.
const tierFields = [
  { name: "upTo1lb", title: "Up to 1 lb of candy" },
  { name: "upTo2lb", title: "Up to 2 lb of candy" },
  { name: "upTo4lb", title: "Up to 4 lb of candy" },
  { name: "over4lb", title: "Over 4 lb of candy" },
] as const;

const region = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    description: "Price in dollars, e.g. 12.50. Leave all four empty to stop shipping there.",
    options: { columns: 2 },
    fields: tierFields.map((t) => defineField({ name: t.name, title: t.title, type: "number", validation: (r) => r.min(0) })),
    validation: (r) =>
      r.custom((v: Record<string, number | undefined> | undefined) => {
        const filled = tierFields.filter((t) => v?.[t.name] != null).length;
        return filled === 0 || filled === tierFields.length ? true : "Fill in all four prices, or leave all four empty to stop shipping here.";
      }),
  });

export const shippingPrices = defineType({
  name: "shippingPrices",
  title: "Shipping prices",
  type: "document",
  description: "What customers pay for shipping. The price depends on where it's going and how much candy is in the order (the Advent Calendar counts as about 1½ lb). Pickup is always free.",
  fields: [
    region("ontario", "Ontario"),
    region("restOfCanada", "Rest of Canada"),
    region("usa", "USA"),
    region("world", "Rest of the world"),
    defineField({
      name: "expressPickupFee",
      title: "Express pickup fee ($)",
      description: "Extra charge for Express pickup (ready in 1–2 days instead of 3–5). e.g. 3 = $3. Leave empty to turn Express pickup off. Regular pickup is always free.",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "freeInCanadaOver",
      title: "Free shipping in Canada on orders of ($)",
      description: "e.g. 75 = free shipping in Canada on orders of $75 or more. Leave empty for no free shipping.",
      type: "number",
      validation: (r) => r.min(0),
    }),
  ],
  preview: { prepare: () => ({ title: "Shipping prices" }) },
});
