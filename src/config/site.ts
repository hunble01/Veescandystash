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

  // Top teal bar. announcementHref makes it a link. Grand-opening code for now
  // (Vee, 2026-11-09). The advent calendar one, to switch back after:
  //   "🎄 NEW: the Christmas Advent Calendar, 24 days of candy surprises!" → "/shop/christmas-advent-calendar"
  announcement: "🎉 Grand opening! 10% off everything for 1 week with code WELCOME10" as string | null,
  announcementHref: "/build-your-stash" as string | null,
  // Shown instead of the bar above once launchOffer.endsAt has passed
  // (Vee, 2026-11-10: promote the advent calendar more). null = keep the bar.
  announcementAfterLaunch: {
    text: "🎄 NEW: the Christmas Advent Calendar, 24 days of candy surprises!",
    href: "/shop/christmas-advent-calendar",
  } as { text: string; href: string } | null,

  // Holiday shown first and bigger (a wide card) in the holiday section
  // (Vee, 2026-11-10: Christmas is coming up). Change the slug for the next
  // holiday, or null to show them all the same size.
  featuredHoliday: "christmas" as string | null,

  // Big promo on the home page, under the ribbons. Points at a product in
  // Sanity by its slug; set to null to hide it (e.g. after Christmas).
  promo: {
    productSlug: "christmas-advent-calendar",
    href: "/shop/christmas-advent-calendar",
    eyebrow: "New for Christmas",
    cta: "Advent Calendar",
    // Line under the name, also on the product page (Vee, 2026-11-05).
    subtitle: "Get yours before December 1st to start the countdown!",
  } as { productSlug: string; href: string; eyebrow: string; cta: string; subtitle?: string } | null,

  contact: {
    email: "contact@veescandystash.ca" as string | null,
    // How quickly Vee answers email (2026-11-05). Shown on Contact and Policies.
    replyTime: "We usually reply within 3 business days." as string | null,
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
    // Free pickup, or shipping anywhere with Canada Post (Vee, 2026-11-09:
    // replaces her own Vaughan/GTA delivery). "delivery" = Canada Post.
    // Vee, 2026-11-10: pickup only for now, Canada Post shipping on hold. Add "delivery" back to switch shipping on.
    // Vee, 2026-11-10 (later): shipping back on with flat rates, Canada only.
    methods: ["pickup", "delivery"] as ("pickup" | "delivery")[],
    pickupArea: "Vaughan, Ontario" as string | null,
    // Canada Post prices are looked up live for the customer's address
    // (src/lib/canadaPost.ts) from Vee's postal code in Maple. Keys and the
    // postal code live in .env.local / Netlify, never here:
    //   CANADA_POST_USERNAME, CANADA_POST_PASSWORD,
    //   CANADA_POST_ORIGIN_POSTAL_CODE, CANADA_POST_SANDBOX=1 (test keys only)
    shipping: {
      carrier: "Canada Post",
      // How shipping is priced (Vee, 2026-11-10): "flat" = Vee's own set
      // prices below; "canadaPost" = live Canada Post prices (needs working
      // keys, see src/lib/canadaPost.ts). Flat for now: Canada Post's new
      // API keeps refusing her key.
      pricing: "flat" as "flat" | "canadaPost",
      // Flat prices in cents, e.g. 1500 = $15.00. null = that speed isn't
      // offered there; a region with both null isn't shipped to at all.
      // Ontario is worked out from the postal code (K, L, M, N or P).
      // Vee, 2026-11-10: $15 Ontario, $22 rest of Canada (Flat Rate Box
      // $18.99 + tax), Standard only. No USA (FDA Prior Notice for food) or
      // world (≈$55–70 per bag) for now. From Canada Post's 2026 price guide.
      flatRates: {
        ontario: { standard: 1500, express: null },
        restOfCanada: { standard: 2200, express: null },
        usa: { standard: null, express: null },
        world: { standard: null, express: null },
      } as Record<"ontario" | "restOfCanada" | "usa" | "world", { standard: number | null; express: number | null }>,
      // Free Standard shipping when the bag's subtotal (before any promo
      // code) reaches this many cents. null = never free.
      freeStandardOverCents: null as number | null,
      // Parcel size used for the price. PLACEHOLDERS until Vee weighs and
      // measures a packed box: candy weight comes from the bag size
      // ("1 lb" etc.), plus the box and padding below.
      packagingGrams: 250,
      // Products without a weight in their size name (e.g. the advent calendar).
      defaultItemGrams: 700,
      // The smallest box that fits the weight is used. Sizes in cm.
      boxes: [
        { upToGrams: 1000, lengthCm: 23, widthCm: 18, heightCm: 10 },
        { upToGrams: 3000, lengthCm: 30, widthCm: 23, heightCm: 15 },
        { upToGrams: 30000, lengthCm: 40, widthCm: 30, heightCm: 25 },
      ],
    },
    // Shown under "Delivery" in the footer (Vee, 2026-11-09). null hides it.
    footerDelivery: "Across Canada" as string | null,
    handlingTime: "About 3 business days in the GTA" as string | null,
  },

  // How customers pay (Vee, 2026-11-08). "manual" = e-Transfer or cash: the
  // site takes the order, shows payment instructions, and Vee marks it paid
  // in the Studio. "stripe" = card checkout (built, switched off for now).
  payments: {
    mode: "manual" as "manual" | "stripe",
    // Only shown in order instructions, never elsewhere on the site.
    eTransferEmail: "vpanetta03@icloud.com" as string | null,
    // Cash is only offered for pickup, paid when the order is picked up.
    cash: true,
    // Unpaid e-Transfer orders are cancelled after this (Vee, 2026-11-09).
    payWithinHours: 48 as number | null,
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
  // Local preview: CHECKOUT_PREVIEW=1 in .env.local opens it on your computer
  // only, so it can be tried before going live.
  checkoutEnabled: true, // Vee, 2026-11-10: ordering on (pickup until Canada Post works)

  // Welcome offer (Vee, 2026-11-05): new visitors see a pop-up; when they
  // create an account we email them this code, and it takes the % off their
  // FIRST order when typed in the cart (checked on the server). Set
  // welcomeDiscountPercent to null to switch the whole offer off.
  // Paused during the grand-opening offer below (Vee, 2026-11-09); set back to 5 after.
  welcomeDiscountPercent: null as number | null,
  welcomeCode: "5OFF!",

  // Grand-opening special (Vee, 2026-11-09): "10% off, 1 week, no account
  // needed, code WELCOME10 in the pop-up". Anyone can use it, on any order,
  // until endsAt; after that the code stops working and the pop-up hides
  // itself. Set endsAt to one week after ordering opens. null = switched off.
  launchOffer: {
    code: "WELCOME10",
    percent: 10,
    endsAt: "2026-11-17T00:00:00-05:00", // through Sunday Nov 16 if we open Nov 10
  } as { code: string; percent: number; endsAt: string } | null,

  // Products hidden from the whole site (Vee, 2026-11-05: "take out ready
  // made mixes"). Remove a slug here to bring that product back.
  hiddenProductSlugs: ["signature-mixed-stash", "sour-stash", "sweet-stash", "sweet-and-sour-stash"] as readonly string[],
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
