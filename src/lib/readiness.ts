import { site } from "@/config/site";

// What still blocks live orders. Server-only: reads env var presence, never
// returns secret values. Shown on the cart page so it's obvious why checkout
// is closed.
export function checkoutBlockers(): string[] {
  const blockers: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) blockers.push("Stripe account not connected");
  if (site.fulfilment.methods.length === 0) blockers.push("Pickup/delivery options not set");
  if (!site.checkoutEnabled) blockers.push("Online ordering switched off in site settings");
  return blockers;
}

export const checkoutOpen = () => checkoutBlockers().length === 0;
