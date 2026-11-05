"use client";

import { useState } from "react";
import { ProductCard } from "@/components/cards";
import { flavourLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

type Filter = "all" | Product["flavour"];

export function ShopGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const flavours = [...new Set(products.map((p) => p.flavour))];
  const shown = filter === "all" ? products : products.filter((p) => p.flavour === filter);

  return (
    <>
      <div role="group" aria-label="Filter by flavour" className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["all", ...flavours] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className="min-h-11 shrink-0 rounded-full bg-white px-5 font-semibold border-[3px] border-ink/80 transition hover:bg-pink-soft aria-pressed:bg-ink aria-pressed:text-cream aria-pressed:border-ink"
          >
            {f === "all" ? "All" : flavourLabel[f]}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
