import type { FaqItem } from "@/lib/types";

// Questions customers will ask (brief §9). Answers stay null until Vee
// writes or approves them: the page shows "Answer coming soon" instead.

export const faq: FaqItem[] = [
  {
    topic: "Ordering",
    question: "How do I place an order?",
    answer:
      "Order right here on the website: build your own stash, pick a themed bag from Occasions, or send us a custom order for any event you like. Having trouble? Just email us.",
    links: ["build", "occasions", "custom", "email", "phone"],
  },
  { topic: "Ordering", question: "What sizes do your bags come in?", answer: "Our bags come in four sizes: 0.5 lb, 1 lb, 2 lb and 5 lb. Planning an occasion? We can make them smaller at your request, just let us know." },
  {
    topic: "Ordering",
    question: "Can the candy in my bag vary?",
    answer:
      "You can pick any candy you want, as long as it’s in stock. If something runs out, we may swap in a similar candy so your stash is still full and sweet.",
  },
  { topic: "Pickup & delivery", question: "Do you offer pickup or delivery?", answer: "Yes, we offer both! Pickup is in Vaughan, Ontario, and we deliver worldwide." },
  { topic: "Pickup & delivery", question: "Which areas do you deliver to?", answer: "We deliver worldwide." },
  { topic: "Pickup & delivery", question: "How long until my order is ready?", answer: "In the GTA, orders are usually ready in about 3 business days. Custom orders for any occasion depend on the quantity, but take roughly 10 days." },
  { topic: "Custom orders", question: "How far ahead should I book an event order?", answer: "We need 10 days’ notice to place a custom order for any occasion, so we can make sure we have all your desired candy, ribbon and themes." },
  { topic: "Custom orders", question: "Is there a minimum quantity for custom favours?", answer: "Yes, the minimum for a custom order is 5 bags." },
  { topic: "Custom orders", question: "Can you match my exact party colours?", answer: "Yes! We can match any colour, design or theme. Just fill out our custom order form and tell us what you have in mind.", links: ["custom"] },
  { topic: "Candy", question: "How should I store my candy?", answer: "Our Build Your Stash bags come in airtight zip-lock bags, so your candy stays fresh right in the bag. You can also move it into a container if you prefer. Our occasion and custom order bags keep candy fresh too, as long as they’re sealed properly." },
  { topic: "Policies", question: "What is your cancellation and refund policy?", answer: "Regular orders can be cancelled for a full refund within 24 hours of ordering. Custom and event orders can be cancelled for a full refund within 48 hours, for a 50% refund after that, and aren’t refunded 5 days or less before your event.", links: ["policies"] },
];
