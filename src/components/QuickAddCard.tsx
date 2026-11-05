"use client";

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
// holiday specials. Ordering still follows the checkout switch (lib/readiness).
export function QuickAddCard({ product, orderingOpen }: { product: Product; orderingOpen: boolean }) {
  const a = accentClasses[product.accent];
  const size = product.sizes.find((s) => s.active && s.priceCents != null);
  const soldOut = product.stockStatus === "sold_out";
  const canBuy = orderingOpen && size != null && !soldOut;
  const [added, setAdded] = useState(false);

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
    <article className="grid overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink bg-white shadow-[var(--shadow-pop-lg)] sm:grid-cols-[2fr_3fr]">
      <div className={`${a.soft} p-3`}>
        <PhotoPlaceholder accent={product.accent} className="aspect-square h-full">
          <WrappedCandy c={k.teal} className="absolute top-[18%] left-[12%] w-[34%] -rotate-12" />
          <Lollipop c={k.pink} className="absolute top-[24%] right-[14%] w-[24%] rotate-12" />
          <WrappedCandy c={k.orange} className="absolute bottom-[18%] left-[34%] w-[30%] rotate-6" />
        </PhotoPlaceholder>
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <h3 className="text-3xl">{product.name}</h3>
        <p className="mt-3 text-lg text-ink-soft">{product.description}</p>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-4xl text-orange" style={{ textShadow: "2px 2px 0 var(--color-ink)" } as CSSProperties}>
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
