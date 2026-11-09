"use client";

// Sanity Studio, embedded in the website at /studio.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { candyOption, faqItem, occasion, product, seasonalCollection, sizeVariant } from "./src/sanity/schemas/catalog";
import { contactMessage, customEnquiry, customerAddresses, customerFavourites, order } from "./src/sanity/schemas/inbox";
import { NextStepAction } from "./src/sanity/actions";
import { structure } from "./src/sanity/structure";

const inboxTypes = new Set(["order", "customEnquiry", "contactMessage"]);

export default defineConfig({
  basePath: "/studio",
  title: "Vee’s Candy Stash",
  projectId,
  dataset,
  schema: {
    types: [product, sizeVariant, candyOption, occasion, seasonalCollection, faqItem, order, customEnquiry, contactMessage, customerFavourites, customerAddresses],
    // Orders, requests and messages only come from the website.
    templates: (templates) => templates.filter((t) => !inboxTypes.has(t.schemaType)),
  },
  document: {
    // Inbox items: the "next step" button comes first (the big one), and they
    // can't be duplicated.
    actions: (actions, { schemaType }) =>
      inboxTypes.has(schemaType) ? [NextStepAction, ...actions.filter((a) => a.action !== "duplicate")] : actions,
  },
  plugins: [structureTool({ structure })],
  apiVersion,
});
