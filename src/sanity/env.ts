// Sanity connection settings. Until NEXT_PUBLIC_SANITY_PROJECT_ID is set the
// site keeps using the local draft data in src/data/.

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-10-01";

export const sanityConfigured = projectId.length > 0;
