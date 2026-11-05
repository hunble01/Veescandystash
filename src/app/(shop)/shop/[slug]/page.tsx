import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductOptions } from "./ProductOptions";
import { FavouriteButton } from "@/components/FavouriteButton";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { Container, DraftNote, Pill } from "@/components/ui";
import { accentClasses, flavourLabel, stockLabel } from "@/lib/format";
import { getProduct, getProducts } from "@/lib/catalog";
import { checkoutOpen } from "@/lib/readiness";

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
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/shop" className="hover:text-ink">Shop</Link> <span aria-hidden>/</span> {product.name}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="grid content-start gap-3">
          <PhotoPlaceholder accent={product.accent} className="aspect-square" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <PhotoPlaceholder key={i} accent={product.accent} className="aspect-square" label="Photo" />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Pill className={`${a.soft} ${a.deep}`}>{flavourLabel[product.flavour]}</Pill>
            {stock && <Pill className="bg-white text-ink-soft">{stock}</Pill>}
          </div>
          <h1 className="text-4xl font-semibold sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg text-ink-soft">{product.description}</p>
          <div className="mt-5">
            <FavouriteButton productId={product.id} />
          </div>

          <ProductOptions product={product} orderingOpen={checkoutOpen()} />

          <dl className="mt-10 divide-y divide-line border-y border-line">
            <Detail term="What’s inside">
              Candy may vary slightly depending on what’s in stock.{" "}
              <DraftMark />
            </Detail>
            <Detail term="Ingredients & allergens">
              {product.ingredientsAllergens ?? <>Full ingredient and allergen details will be listed here. <DraftMark /></>}
            </Detail>
            <Detail term="Ready in">{product.prepTime ?? <>Order timing coming soon. <DraftMark /></>}</Detail>
            <Detail term="Packaging">
              Packed in a candy bag finished with a Vee’s Candy Stash sticker. <DraftMark />
            </Detail>
          </dl>

          <div className="mt-6">
            <DraftNote>The “What’s inside” wording assumes candy may vary by stock. Vee to confirm this policy.</DraftNote>
          </div>
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
