"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { loadFavourites, toggleFavourite } from "@/app/(shop)/account/actions";

// Heart toggle for a product. Signed-out shoppers get a log-in link instead,
// so the page itself stays cached and the same for everyone.
export function FavouriteButton({ productId }: { productId: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [ids, setIds] = useState<string[] | null>(null);
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    if (isSignedIn) loadFavourites().then(setIds);
  }, [isSignedIn]);

  const base = "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-white px-4 font-bold transition hover:bg-pink-soft";
  if (!isLoaded) return null;
  if (!isSignedIn) {
    return (
      <Link href="/sign-in" className={base}>
        <span aria-hidden>♡</span> Log in to save
      </Link>
    );
  }

  const on = ids?.includes(productId) ?? false;
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={ids == null || saving}
      onClick={() => startSaving(async () => setIds(await toggleFavourite(productId, !on)))}
      className={`${base} aria-pressed:bg-pink-soft disabled:opacity-60`}
    >
      <span aria-hidden className={on ? "text-pink-deep" : ""}>{on ? "♥" : "♡"}</span>
      {on ? "Saved to favourites" : "Save to favourites"}
    </button>
  );
}
