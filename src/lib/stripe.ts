import Stripe from "stripe";

// Server-only Stripe client. Null until STRIPE_SECRET_KEY is set.
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
