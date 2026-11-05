import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { productHref } from "@/components/cards";
import { accentClasses, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Lollipop, WrappedCandy, candyColours as k } from "./Candies";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

// Holiday special (e.g. the Christmas advent calendar), shown big on its
// holiday page. Shows the first photo only; tapping anywhere opens the
// product page, which has all the photos and the Add to bag button (Vee,
// 2026-11-04).
export function SpecialCard({ product }: { product: Product }) {
  const a = accentClasses[product.accent];
  const size = product.sizes.find((s) => s.active && s.priceCents != null);
  const photo = product.photos[0];

  return (
    <Link
      href={productHref(product)}
      className="group grid overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink bg-white shadow-[var(--shadow-pop-lg)] transition hover:-translate-y-1 md:grid-cols-2"
    >
      <div className={`${a.soft} p-3`}>
        {photo ? (
          <div className="relative aspect-[1.08] overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-white">
            <Image
              src={photo}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 560px, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
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
        {size && (
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-5xl text-orange" style={{ textShadow: "2px 3px 0 var(--color-ink)" } as CSSProperties}>
              {formatPrice(size.priceCents)}
            </span>
            <span className="font-bold text-ink-soft">{size.label}</span>
          </p>
        )}
        <span className="mt-6 inline-flex min-h-13 w-fit items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-7 font-extrabold shadow-[var(--shadow-pop)] transition group-hover:bg-pink">
          See it &amp; add to bag
          <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
