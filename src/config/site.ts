// Site settings (brief §15 "Site setting").
// Every `null` is a PLACEHOLDER: the page shows "coming soon" wording
// instead of an invented value. Fill these in once Vee confirms them.

export const site = {
  name: "Vee’s Candy Stash",
  slogan: "Every Sweet Tooth Needs a Stash.",
  description:
    "Sweet little candy bags, party-ready favours and custom candy for every occasion, from a small Ontario candy shop.",
  region: "Ontario, Canada",

  // Supplied logo file lives in /public. Currently cropped from a phone
  // screenshot (docs/brand/); swap in the original file when Vee has it. Set
  // to null to show the labelled placeholder. We never draw our own logo.
  logo: { src: "/logo.png", width: 320, height: 320 } as { src: string; width: number; height: number } | null,

  // Top teal bar. announcementHref makes it a link (Vee, 2026-11-04: promote
  // the advent calendar).
  announcement: "🎄 NEW: the Christmas Advent Calendar, 24 days of candy surprises!" as string | null,
  announcementHref: "/shop/christmas-advent-calendar" as string | null,

  // Big promo on the home page, under the ribbons. Points at a product in
  // Sanity by its slug; set to null to hide it (e.g. after Christmas).
  promo: {
    productSlug: "christmas-advent-calendar",
    href: "/shop/christmas-advent-calendar",
    eyebrow: "New for Christmas",
    cta: "See it & add to bag",
  } as { productSlug: string; href: string; eyebrow: string; cta: string } | null,

  contact: {
    email: "contact@veescandystash.ca" as string | null,
    // Vee only takes contact by email (2026-11-04); null hides every phone link.
    phone: null as string | null,
  },

  social: {
    instagram: "https://www.instagram.com/VeesCandyStash/" as string | null,
    tiktok: "https://www.tiktok.com/@veescandystash" as string | null,
    facebook: null as string | null,
  },

  fulfilment: {
    // Which options checkout offers. Empty until Vee decides, and checkout
    // stays off until at least one is set.
    methods: ["pickup", "delivery"] as ("pickup" | "delivery")[],
    pickupArea: "Vaughan, Ontario" as string | null,
    deliveryArea: "Worldwide" as string | null,
    shipping: null as string | null,
    handlingTime: "About 3 business days in the GTA" as string | null,
  },

  // Sizes offered in the occasion/holiday and custom order forms (Vee, 2026-10-29;
  // 5 lb became 4 lb on 2026-11-04).
  // 0.3 lb is for occasion and custom orders only, not Build Your Stash.
  bagSizes: ["0.3 lb", "0.5 lb", "1 lb", "2 lb", "4 lb", "Smaller favour bags"],

  customOrders: {
    minimumQuantity: 5 as number | null,
    leadTime: "10 days, depending on quantity" as string | null,
    // Earliest date the occasion/holiday order form accepts, in days from today.
    minNoticeDays: 10 as number | null,
    deposit: null as string | null,
  },

  // Owner's on/off switch for taking orders. Even when true, checkout only
  // opens once lib/readiness.ts finds Stripe keys, prices and a fulfilment
  // method. Flip to true when policies are published and you're ready to sell.
  checkoutEnabled: false,
} as const;

export const nav = [
  { href: "/build-your-stash", label: "Build Your Stash" },
  { href: "/occasions", label: "Occasions" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/about", label: "About" },
  { href: "/policies", label: "Policies" },
] as const;

export const footerNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
