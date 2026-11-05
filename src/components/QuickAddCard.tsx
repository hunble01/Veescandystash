"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { cart } from "@/lib/cart";
import { accentClasses, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Lollipop, WrappedCandy, candyColours as k } from "./Candies";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { Button } from "./ui";

// A one-size product (e.g. the Christmas advent calendar) that customers add
// straight to the cart, with nothing to choose (Vee, 2026-11-04). Used for
// holiday specials. Shows the product's photos (tap a thumbnail to switch)
// or a placeholder. Ordering still follows the checkout switch (lib/readiness).
export function QuickAddCard({ product, orderingOpen }: { product: Product; orderingOpen: boolean }) {
  const a = accentClasses[product.accent];
  const size = product.sizes.find((s) => s.active && s.priceCents != null);
  const soldOut = product.stockStatus === "sold_out";
  const canBuy = orderingOpen && size != null && !soldOut;
  const [added, setAdded] = useState(false);
  const [shown, setShown] = useState(0);
  const photos = product.photos;

  function add() {
    if (!size || size.priceCents == null) return;
    cart.add({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPriceCents: size.priceCents,
      accent: product.accent,
    });
    setAdded(true);
  }

  return (
    <article className="grid overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink bg-white shadow-[var(--shadow-pop-lg)] md:grid-cols-[1fr_1fr]">
      <div className={`${a.soft} p-3`}>
        {photos.length > 0 ? (
          <div>
            <div className="relative aspect-[1.08] overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] border-2 border-ink/10 bg-white">
              <Image
                src={photos[shown]}
                alt={`${product.name}, photo ${shown + 1} of ${photos.length}`}
                fill
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover"
                priority
              />
            </div>
            {photos.length > 1 && (
              <div className="mt-3 flex gap-3">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setShown(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={i === shown}
                    className={`relative h-16 w-16 overflow-hidden rounded-xl border-[3px] transition ${i === shown ? "border-ink shadow-[var(--shadow-pop)]" : "border-ink/20 opacity-80 hover:opacity-100"}`}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <PhotoPlaceholder accent={product.accent} className="aspect-square h-full">
            <WrappedCandy c={k.teal} className="absolute top-[18%] left-[12%] w-[34%] -rotate-12" />
            <Lollipop c={k.pink} className="absolute top-[24%] right-[14%] w-[24%] rotate-12" />
            <WrappedCandy c={k.orange} className="absolute bottom-[18%] left-[34%] w-[30%] rotate-6" />
          </PhotoPlaceholder>
        )}
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="mb-2 inline-flex w-fit -rotate-2 rounded-full border-2 border-ink bg-pink px-3 py-1 text-xs font-extrabold tracking-[0.15em] text-white uppercase [text-shadow:1px_1px_0_var(--color-ink)]">
          New
        </p>
        <h3 className="font-display text-4xl font-normal">{product.name}</h3>
        <p className="mt-3 text-lg text-ink-soft">{product.description}</p>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-5xl text-orange" style={{ textShadow: "2px 3px 0 var(--color-ink)" } as CSSProperties}>
            {formatPrice(size?.priceCents ?? null)}
          </span>
          {size && <span className="font-bold text-ink-soft">{size.label}</span>}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={add} disabled={!canBuy}>
            {soldOut ? "Sold out" : !orderingOpen ? "Online ordering coming soon" : "Add to cart"}
          </Button>
          {added && (
            <p role="status" className="font-bold text-teal-deep">
              Added! <Link href="/cart" className="underline underline-offset-4">View cart →</Link>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
