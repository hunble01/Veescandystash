import { site } from "@/config/site";
import { emailConfigured } from "@/lib/notify";
import { writeClient } from "@/sanity/client";

// What still blocks live orders. Server-only: reads env var presence, never
// returns secret values. Shown on the cart page so it's obvious why checkout
// is closed.
export function checkoutBlockers(): string[] {
  const blockers: string[] = [];
  if (site.payments.mode === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY) blockers.push("Stripe account not connected");
  } else {
    if (!site.payments.eTransferEmail) blockers.push("e-Transfer email not set");
    if (!writeClient && !emailConfigured) blockers.push("Nowhere to send orders (Sanity or email)");
  }
  if (site.fulfilment.methods.length === 0) blockers.push("Pickup/delivery options not set");
  // CHECKOUT_PREVIEW=1 is for trying checkout locally; never set it on Netlify.
  const preview = process.env.CHECKOUT_PREVIEW === "1" && process.env.NODE_ENV !== "production";
  if (!site.checkoutEnabled && !preview) blockers.push("Online ordering switched off in site settings");
  return blockers;
}

export const checkoutOpen = () => checkoutBlockers().length === 0;
