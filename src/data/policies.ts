// Policies page sections. Each point is Vee's own wording; a section with
// no points shows "Coming soon" until she writes or approves it.

export interface PolicySection {
  id: string;
  title: string;
  points: string[];
}

export const policies: PolicySection[] = [
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
    id: "candy",
    title: "Our candy",
    points: [
      "All our candy is stored in airtight sealed containers, ready to be packed into bags and sent to you.",
      "You can pick any candy you want, as long as it’s in stock. If something runs out, we may swap in a similar candy so your stash is still full and sweet.",
      "Our Build Your Stash bags come in airtight zip-lock bags, so your candy stays fresh right in the bag. Our occasion and custom order bags keep candy fresh too, as long as they’re sealed properly.",
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
