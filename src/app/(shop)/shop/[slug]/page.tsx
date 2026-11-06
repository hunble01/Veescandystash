import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGallery } from "./ProductGallery";
import { ProductOptions } from "./ProductOptions";
import { FavouriteButton } from "@/components/FavouriteButton";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Container, DraftNote, Pill } from "@/components/ui";
import { accentClasses, flavourLabel, stockLabel } from "@/lib/format";
import { getProduct, getProducts } from "@/lib/catalog";
import { checkoutOpen } from "@/lib/readiness";
import { site } from "@/config/site";
import { TrackView } from "@/lib/recentlyViewed";

export async function generateStaticParams() {
  return (await getProducts()).filter((p) => p.type !== "builder").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.name, description: product.summary } : {};
}

// Wrapped in Suspense: pages added in Sanity after the last build are only
// known at request time, so the slug is read inside the boundary.
export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const a = accentClasses[product.accent];
  const stock = stockLabel[product.stockStatus];

  return (
    <Container className="py-8 sm:py-12">
      <TrackView slug={product.slug} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/shop" className="hover:text-ink">Shop</Link> <span aria-hidden>/</span> {product.name}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Pill className={`${a.soft} ${a.deep}`}>{flavourLabel[product.flavour]}</Pill>
            {stock && <Pill className="bg-white text-ink-soft">{stock}</Pill>}
          </div>
          <h1 className="text-4xl font-semibold sm:text-5xl">{product.name}</h1>
          {site.promo?.subtitle && site.promo.productSlug === product.slug && (
            <p className="mt-3 inline-block -rotate-1 rounded-full border-[3px] border-ink bg-holiday-gold px-4 py-1.5 font-extrabold shadow-[var(--shadow-pop)]">
              🗓️ {site.promo.subtitle}
            </p>
          )}
          <p className="mt-4 text-lg text-ink-soft">{product.description}</p>
          <div className="mt-5">
            <FavouriteButton productId={product.id} />
          </div>

          <ProductOptions product={product} orderingOpen={checkoutOpen()} />

          <dl className="mt-10 divide-y divide-line border-y border-line">
            <Detail term={product.slug === "christmas-advent-calendar" ? "Description" : "What’s inside"}>
              {product.slug === "christmas-advent-calendar" ? (
                // Vee's own wording, 2026-11-05.
                "A variety of candy! Each day, you get to try a new candy from my stock. Every numbered box has multiple pieces of candy in its own individually sealed bag. This is a limited-edition Christmas treat, so grab yours while they last!"
              ) : (
                <>
                  Candy may vary slightly depending on what’s in stock. <DraftMark />
                </>
              )}
            </Detail>
            {/* The advent calendar shows only its Description (Vee, 2026-11-05) */}
            {product.slug !== "christmas-advent-calendar" && (
              <>
                <Detail term="Ingredients & allergens">
                  {product.ingredientsAllergens ?? (
                    // Vee's shop-wide allergen warning (2026-11-05).
                    <>
                      Not suitable for anyone with a severe food allergy. Our candy may contain milk, soy, wheat, peanuts, tree nuts or
                      other allergens.{" "}
                      <Link href="/policies#allergens" className="font-bold text-pink-deep underline underline-offset-4">
                        Allergens and ingredients
                      </Link>
                    </>
                  )}
                </Detail>
                <Detail term="Ready in">{product.prepTime ?? <>Order timing coming soon. <DraftMark /></>}</Detail>
                <Detail term="Packaging">
                  Packed in a candy bag finished with a Vee’s Candy Stash sticker. <DraftMark />
                </Detail>
              </>
            )}
          </dl>

          {product.slug !== "christmas-advent-calendar" && (
            <div className="mt-6">
              <DraftNote>The “What’s inside” wording assumes candy may vary by stock. Vee to confirm this policy.</DraftNote>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function Detail({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-3">
      <dt className="font-semibold">{term}</dt>
      <dd className="text-ink-soft sm:col-span-2">{children}</dd>
    </div>
  );
}

function DraftMark() {
  return <span className="rounded bg-ink/10 px-1.5 text-[11px] font-bold tracking-wide uppercase">Draft</span>;
}
