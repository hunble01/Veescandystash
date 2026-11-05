"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { MAX_QTY, cart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

// orderingOpen comes from the server (lib/readiness.ts): Stripe connected,
// fulfilment set and ordering switched on.
export function ProductOptions({ product, orderingOpen }: { product: Product; orderingOpen: boolean }) {
  const sizes = product.sizes.filter((s) => s.active);
  const [sizeId, setSizeId] = useState(sizes[0]?.id);
  const [qty, setQty] = useState(1);
  const size = sizes.find((s) => s.id === sizeId);
  const total = size?.priceCents != null ? size.priceCents * qty : null;
  const soldOut = product.stockStatus === "sold_out";
  const canBuy = orderingOpen && size?.priceCents != null && !soldOut;
  const [added, setAdded] = useState(0);

  function addToCart() {
    if (!size || size.priceCents == null) return;
    cart.add(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        sizeId: size.id,
        sizeLabel: size.label,
        unitPriceCents: size.priceCents,
        accent: product.accent,
      },
      qty,
    );
    setAdded((n) => n + 1);
  }

  return (
    <div className="mt-8 space-y-6">
      {/* One-size products (e.g. the advent calendar) skip the size choice (Vee, 2026-11-04). */}
      <fieldset className={sizes.length === 1 ? "hidden" : undefined}>
        <legend className="mb-3 font-semibold">Size</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sizes.map((s) => (
            <label
              key={s.id}
              className="flex min-h-16 cursor-pointer flex-col justify-center rounded-2xl bg-white px-4 py-3 border-[3px] border-ink/80 transition has-checked:bg-orange-soft has-checked:border-ink has-checked:shadow-[var(--shadow-pop)] has-focus-visible:outline-3 has-focus-visible:outline-teal"
            >
              <input type="radio" name="size" value={s.id} checked={s.id === sizeId} onChange={() => setSizeId(s.id)} className="sr-only" />
              <span className="font-semibold">{s.label}</span>
              <span className="text-xs text-ink-soft">{s.weightGrams ? `${s.weightGrams} g` : "Weight TBC"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p id="qty-label" className="mb-3 font-semibold">Quantity</p>
          <div role="group" aria-labelledby="qty-label" className="flex items-center rounded-full bg-white border-[3px] border-ink/80">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-12 rounded-full text-xl hover:bg-cream">−</button>
            <output aria-live="polite" className="w-10 text-center font-semibold">{qty}</output>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} className="h-12 w-12 rounded-full text-xl hover:bg-cream">+</button>
          </div>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Total</p>
          <p className="font-display text-2xl text-orange-deep">{formatPrice(total)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" disabled={!canBuy} onClick={addToCart} className="w-full sm:w-auto">
          {soldOut ? "Sold out" : canBuy ? "Add to cart" : "Online ordering coming soon"}
        </Button>
        <p aria-live="polite" className="font-bold">
          {added > 0 && (
            <span key={added} className="inline-flex animate-[pop-in_300ms_both] items-center gap-2">
              Added to your stash!{" "}
              <Link href="/cart" className="text-teal-deep underline decoration-2 underline-offset-4">
                View cart →
              </Link>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
