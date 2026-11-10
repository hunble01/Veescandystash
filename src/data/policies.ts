// Policies page sections. Each point is Vee's own wording; a section with
// no points shows "Coming soon" until she writes or approves it.

export interface PolicySection {
  id: string;
  title: string;
  /** Shown first, big, bold and red (e.g. the allergy warning). */
  alert?: string;
  /** "{email}" in a point becomes a link to the shop's email address. */
  points: string[];
}

import { site } from "@/config/site";


export const policies: PolicySection[] = [
  {
    // Vee, 2026-11-08: e-Transfer and cash; delivery prices from site config.
    id: "paying",
    title: "Paying, pickup and delivery",
    points: [
      "We take Interac e-Transfer and cash. After you place your order, you’ll get your order number and our e-Transfer details. Please put your order number in the e-Transfer message.",
      "e-Transfer orders are packed once your payment arrives, and must be paid before pickup or delivery. Cash is for pickup orders only, paid when you pick up.",
      ...(site.payments.payWithinHours
        ? [`Please send your e-Transfer within ${site.payments.payWithinHours} hours of placing your order. If it hasn’t arrived by then, your order will be cancelled.`]
        : []),
      `Pickup in ${site.fulfilment.pickupArea ?? "Vaughan"} is free. We’ll email you the address and a time when your order is ready.`,
      // Canada Post shipping (Vee, 2026-11-09), priced live at checkout.
      site.fulfilment.methods.includes("delivery")
        ? `Shipping: we ship across Canada and around the world with ${site.fulfilment.shipping.carrier}. Choose Standard or Express at checkout, and the shipping price for your address is added automatically.`
        : `Shipping: coming soon with ${site.fulfilment.shipping.carrier}. For now, all orders are free pickup in ${site.fulfilment.pickupArea ?? "Vaughan"}.`,
    ],
  },
  {
    id: "refunds",
    title: "Refunds and cancellations",
    points: [
      "If your bag or candy arrives damaged, or your order isn’t right, please email us at contact@veescandystash.ca with a photo, your order number and name so we can look into it.",
      "Regular orders: you can cancel for a full refund within 24 hours of placing your order. After 24 hours, orders can’t be cancelled or refunded.",
      "Custom and event orders: you can cancel for a full refund within 48 hours of placing your order. After 48 hours, cancelling refunds 50% of your payment. Cancelling 5 days or less before your event is not refunded.",
    ],
  },
  {
    // Vee, 2026-11-05: deposit and label approval.
    id: "custom-orders",
    title: "Custom and occasion orders",
    points: [
      "Custom and occasion orders need a $50 deposit to hold your order in place. Once your deposit is in, your date is booked and we start planning your candy, colours and labels just for you. Your deposit goes toward your order total, and the rest is paid before pickup or delivery.",
      "Changed your mind? Your $50 deposit is fully refunded if you cancel within 48 hours of placing your order. After 48 hours, the deposit can’t be refunded, because we’ve already started buying candy and planning your order.",
      "Before we print anything, we’ll send you a picture of your custom tag or label to approve, so your names, date and wording are just right.",
      // Vee, 2026-11-06: rush orders welcome, extra fee (amount not set).
      "Need it sooner? Rush orders are welcome! Extra fees will apply, and we’ll let you know the cost before you confirm your order.",
    ],
  },
  {
    // Vee, 2026-11-05: welcome code rules.
    id: "welcome-code",
    title: "Discount codes",
    points: [
      ...(site.launchOffer
        ? [`Grand opening: use code ${site.launchOffer.code} for ${site.launchOffer.percent}% off your order during our first week. No account needed. It can’t be combined with other codes or used on a past order.`]
        : []),
      ...(site.welcomeDiscountPercent
        ? [`Our ${site.welcomeDiscountPercent}% welcome code is for your first order only, for customers with an account. We email it to you when you create your account. It can’t be combined with other codes or used on a past order.`]
        : []),
    ],
  },
  {
    // Vee's allergen and ingredient info (2026-11-05), in our own words.
    id: "allergens",
    title: "Allergens and ingredients",
    alert: "Not suitable for anyone with a severe food allergy.",
    points: [
      "We buy our candy from a number of different makers and pack every order in a shared space, so we can’t promise any candy is free from allergens. If you have a severe allergy, please don’t order from us. We’d rather keep you safe.",
      "Our candy may contain milk, soy, wheat, peanuts, tree nuts or other allergens.",
      "Have a question about a certain candy? Email us at {email} before you order and we’ll happily help. We usually reply within 3 business days.",
      "What’s inside: almost all of our candy (everything except candy labelled 🌱 Vegan) contains sugar, glucose syrup, starch (from corn, potato or wheat), gelatin, food acids (citric, malic and lactic), natural and artificial flavours, vegetable oil, a shiny coating (carnauba wax or beeswax) and food colours, which may include Red 40, Yellow 5, Yellow 6 and Blue 1.",
    ],
  },
  {
    id: "candy",
    title: "Our candy",
    points: [
      "All our candy is stored in airtight sealed containers, ready to be packed into bags and sent to you.",
      "You can pick any candy you want, as long as it’s in stock. If something runs out, we may swap in a similar candy so your stash is still full and sweet.",
      "Our Build Your Stash bags come in airtight zip-lock bags, so your candy stays fresh right in the bag. Our occasion and custom order bags keep candy fresh too, as long as they’re sealed properly.",
    ],
  },
  {
    // Vee, 2026-11-05: under-18s need an adult to order.
    id: "ordering-age",
    title: "Ordering age",
    points: [
      "You must be 18 or older to place an order. If you’re under 18, please ask a parent or guardian to order for you. They’ll need to place the order and pay for it themselves.",
    ],
  },
  {
    // Vee's privacy promise (2026-10-30), including how orders appear in videos and lives.
    id: "privacy",
    title: "Your privacy",
    points: [
      "Your privacy matters to us. Everything you share with us through our website, like your name, email, phone number, address and order details, is kept safe, secure and confidential.",
      "We love sharing the sweet side of what we do! If we film your order or go live while packing it, we will only ever refer to it by your order number. We never share your name or any other personal information, and everything stays completely confidential.",
    ],
  },
];
