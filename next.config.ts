import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Photos uploaded in the Studio are served from Sanity's image CDN.
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }] },
  // Room for up to 3 inspiration photos on the custom order form (the
  // browser shrinks them first, so this is a safety margin).
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
