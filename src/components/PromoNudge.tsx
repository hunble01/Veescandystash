import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

// Small seasonal promo card (Vee, 2026-11-10: "make the advent calendar more
// noticeable"). Driven by `site.promo`, like the big home-page promo; hidden
// when that's null or the product isn't found.
export function PromoNudge({ products, className = "" }: { products: Product[]; className?: string }) {
  const promo = site.promo;
  const product = promo && products.find((p) => p.slug === promo.productSlug);
  if (!promo || !product) return null;
  const size = product.sizes.find((s) => s.active && s.priceCents != null);
  const photo = product.photos[0];

  return (
    <Link
      href={promo.href}
      className={`group flex items-center gap-4 rounded-[var(--radius-card)] border-[3px] border-ink p-4 text-white shadow-[var(--shadow-pop)] transition hover:-translate-y-0.5 sm:gap-6 sm:p-5 ${className}`}
      style={{ background: "radial-gradient(ellipse at 30% 0%, var(--color-holiday-green) 0%, var(--color-holiday-green-deep) 80%)" }}
    >
      {photo && (
        <span className="relative h-24 w-24 shrink-0 -rotate-3 overflow-hidden rounded-2xl border-[3px] border-ink bg-white sm:h-28 sm:w-28">
          <Image src={photo} alt="" fill sizes="112px" className="object-cover" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold tracking-[0.15em] text-holiday-gold uppercase">🎄 Don’t forget · {promo.eyebrow}</span>
        <span className="mt-1 block font-display text-2xl leading-tight sm:text-3xl">{product.name}</span>
        {promo.subtitle && <span className="mt-1 block text-sm font-semibold text-white/90">{promo.subtitle}</span>}
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {size && <span className="font-display text-2xl text-holiday-gold">{formatPrice(size.priceCents)}</span>}
          <span className="font-extrabold underline-offset-4 group-hover:underline">{promo.cta} →</span>
        </span>
      </span>
    </Link>
  );
}
