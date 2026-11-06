"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

// Products a shopper has looked at, newest first, kept in their own browser
// only (never sent anywhere). Used for "Add something sweet?" in the cart.
const KEY = "vcs-recently-viewed";
const MAX = 12;

export function readRecentlyViewed(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Drop on a page to remember that the shopper viewed this product. */
export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const next = [slug, ...readRecentlyViewed().filter((s) => s !== slug)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, [slug]);
  return null;
}

const noSubscribe = () => () => {};
const rawViewed = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};

/** The shopper's recently viewed product slugs (empty on the server). */
export function useRecentlyViewed(): string[] {
  const raw = useSyncExternalStore(noSubscribe, rawViewed, () => "[]");
  return useMemo(() => {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, [raw]);
}
