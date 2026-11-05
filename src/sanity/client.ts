import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

// Read client for catalogue content. A read token (server-only) lets the
// dataset stay private, which keeps customer orders off the public API.
export const readClient = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: !process.env.SANITY_API_READ_TOKEN,
      token: process.env.SANITY_API_READ_TOKEN,
      // Local preview only: SANITY_PREVIEW_DRAFTS=1 in .env.local shows unpublished
      // Studio drafts, so changes can be checked before they go live. Never
      // set it on Netlify.
      perspective: process.env.SANITY_PREVIEW_DRAFTS === "1" ? "drafts" : "published",
    })
  : null;

// Write client for orders, enquiries and messages. Server-only.
export const writeClient =
  sanityConfigured && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({ projectId, dataset, apiVersion, useCdn: false, token: process.env.SANITY_API_WRITE_TOKEN })
    : null;
