"use client";

// Sanity Studio, embedded in the website at /studio.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { candyOption, faqItem, occasion, product, seasonalCollection, shippingPrices, sizeVariant } from "./src/sanity/schemas/catalog";
import { contactMessage, customEnquiry, customerAddresses, customerFavourites, order } from "./src/sanity/schemas/inbox";
import { NextStepAction } from "./src/sanity/actions";
import { structure } from "./src/sanity/structure";

const inboxTypes = new Set(["order", "customEnquiry", "contactMessage"]);
// One-of-a-kind pages: no "new" or "duplicate"/"delete" (Vee edits the one page).
const singletons = new Set(["shippingPrices"]);

export default defineConfig({
  basePath: "/studio",
  title: "Vee’s Candy Stash",
  projectId,
  dataset,
  schema: {
    types: [product, sizeVariant, candyOption, occasion, seasonalCollection, faqItem, shippingPrices, order, customEnquiry, contactMessage, customerFavourites, customerAddresses],
    // Orders, requests and messages only come from the website.
    templates: (templates) => templates.filter((t) => !inboxTypes.has(t.schemaType) && !singletons.has(t.schemaType)),
  },
  document: {
    // Inbox items: the "next step" button comes first (the big one), and they
    // can't be duplicated.
    actions: (actions, { schemaType }) =>
      inboxTypes.has(schemaType)
        ? [NextStepAction, ...actions.filter((a) => a.action !== "duplicate")]
        : singletons.has(schemaType)
          ? actions.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action))
          : actions,
  },
  plugins: [structureTool({ structure })],
  apiVersion,
});
