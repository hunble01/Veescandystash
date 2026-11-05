import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Sparkle, candyColours as k } from "@/components/Candies";
import { ButtonLink, Container } from "@/components/ui";
import { site } from "@/config/site";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

// Big seasonal promo on the home page (Vee, 2026-11-04: the Christmas advent
// calendar). Driven by `site.promo`; hidden when that's null or the product
// isn't found.
export async function HomePromo() {
  const promo = site.promo;
  if (!promo) return null;
  const product = (await getProducts()).find((p) => p.slug === promo.productSlug);
  if (!product) return null;
  const size = product.sizes.find((s) => s.active && s.priceCents != null);
  // First photo only; the product page shows the rest (Vee, 2026-11-04).
  const photo1 = product.photos[0];

  return (
    <section aria-labelledby="promo-title" className="relative overflow-hidden border-y-[3px] border-ink bg-holiday-red-soft py-16 sm:py-20">
      <Sparkle aria-hidden c={k.pink} className="absolute top-8 left-[6%] w-8" />
      <Sparkle aria-hidden c={k.teal} className="absolute right-[8%] bottom-10 w-6" />
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* First photo, tilted like a snapshot; tapping it opens the product */}
        <div className="relative mx-auto w-full max-w-lg">
          {photo1 ? (
            <Link href={promo.href} aria-label={product.name} className="relative block aspect-[1.08] -rotate-3 overflow-hidden rounded-3xl border-[3px] border-ink bg-white shadow-[var(--shadow-pop-lg)] transition hover:-rotate-1">
              <Image src={photo1} alt={`${product.name}, open with candy inside`} fill sizes="(min-width: 1024px) 520px, 90vw" className="object-cover" />
            </Link>
          ) : null}
          <span className="absolute -top-5 -left-3 grid h-20 w-20 -rotate-12 place-items-center rounded-full border-[3px] border-ink bg-holiday-red text-center font-display text-xl leading-none text-white shadow-[var(--shadow-pop)] [text-shadow:2px_2px_0_var(--color-ink)]">
            New!
          </span>
        </div>

        <div className="text-center lg:text-left">
          <p className="text-sm font-extrabold tracking-[0.18em] text-holiday-red-deep uppercase">🎄 {promo.eyebrow}</p>
          <h2 id="promo-title" className="mt-3 text-[clamp(2.3rem,7vw,3.75rem)] text-holiday-red">
            {product.name}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg font-semibold text-ink-soft lg:mx-0">{product.description}</p>
          {size && (
            <p className="mt-6 flex items-baseline justify-center gap-3 lg:justify-start">
              <span className="font-display text-5xl text-orange" style={{ textShadow: "2px 3px 0 var(--color-ink)" } as CSSProperties}>
                {formatPrice(size.priceCents)}
              </span>
              <span className="font-bold text-ink-soft">{size.label} of surprises</span>
            </p>
          )}
          <ButtonLink href={promo.href} className="mt-7">
            {promo.cta} →
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
