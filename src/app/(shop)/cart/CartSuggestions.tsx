"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BagIllustration } from "@/components/BagIllustration";
import { cart, useCart } from "@/lib/cart";
import { accentClasses, formatPrice } from "@/lib/format";
import { useRecentlyViewed } from "@/lib/recentlyViewed";
import type { Product } from "@/lib/types";

// "Add something sweet?" in the cart (Vee, 2026-11-05): first the things the
// shopper looked at but didn't add, then anything else they don't have yet.
export function CartSuggestions({ products }: { products: Product[] }) {
  const { lines } = useCart();
  const viewed = useRecentlyViewed();

  const inCart = new Set(lines.map((l) => l.productId));
  const available = products.filter((p) => p.stockStatus !== "sold_out" && p.sizes.some((s) => s.active && s.priceCents != null));
  // Builder bags can be built again with different candy, so they always qualify.
  const notInCart = available.filter((p) => p.type === "builder" || !inCart.has(p.id));
  const rank = (p: Product) => {
    const i = viewed.indexOf(p.slug);
    return i === -1 ? 100 : i;
  };
  const picks = [...notInCart].sort((a, b) => rank(a) - rank(b)).slice(0, 3);
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="suggest-title" className="mt-14">
      <h2 id="suggest-title" className="text-3xl text-pink">Add something sweet?</h2>
      <p className="mt-1 font-semibold text-ink-soft">Treats you might like with your order.</p>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((p) => (
          <li key={p.id}>
            <Suggestion product={p} recentlyViewed={viewed.includes(p.slug)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Suggestion({ product: p, recentlyViewed }: { product: Product; recentlyViewed: boolean }) {
  const [added, setAdded] = useState(false);
  const sizes = p.sizes.filter((s) => s.active && s.priceCents != null);
  const from = Math.min(...sizes.map((s) => s.priceCents!));
  // One tap to add when there's nothing to choose; otherwise go pick options.
  const oneTap = p.type !== "builder" && sizes.length === 1 ? sizes[0] : null;
  const href = p.type === "builder" ? "/build-your-stash" : `/shop/${p.slug}`;
  const a = accentClasses[p.accent];

  return (
    <div className="flex h-full gap-4 rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-4 shadow-[var(--shadow-pop)]">
      <Link href={href} className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-ink ${a.soft}`}>
        {p.photos[0] ? (
          <Image src={p.photos[0]} alt="" fill sizes="96px" className="object-cover" />
        ) : p.type === "builder" ? (
          // Same bag drawing as Build Your Stash, sized like the 1 lb bag (Vee, 2026-11-05).
          <BagIllustration scale={0.4} label="1 lb" />
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        {recentlyViewed && <p className="text-xs font-extrabold tracking-wide text-teal-deep uppercase">You looked at this</p>}
        <Link href={href} className="text-lg leading-tight font-extrabold hover:underline">{p.name}</Link>
        <p className="font-bold text-ink-soft">{sizes.length > 1 ? `From ${formatPrice(from)}` : formatPrice(from)}</p>
        <div className="mt-auto pt-3">
          {oneTap ? (
            <button
              type="button"
              disabled={added}
              onClick={() => {
                cart.add({
                  productId: p.id,
                  productSlug: p.slug,
                  productName: p.name,
                  sizeId: oneTap.id,
                  sizeLabel: oneTap.label,
                  unitPriceCents: oneTap.priceCents!,
                  accent: p.accent,
                });
                setAdded(true);
              }}
              className="min-h-11 rounded-full border-[3px] border-ink bg-orange px-4 font-extrabold shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5 disabled:bg-teal disabled:shadow-none"
            >
              {added ? "Added ✓" : "+ Add to cart"}
            </button>
          ) : (
            <Link href={href} className="inline-flex min-h-11 items-center rounded-full border-[3px] border-ink bg-white px-4 font-extrabold shadow-[3px_3px_0_var(--color-ink)] hover:bg-pink-soft">
              {p.type === "builder" ? "Build a bag →" : "Choose options →"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
