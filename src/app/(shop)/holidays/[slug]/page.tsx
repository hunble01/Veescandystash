import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ThemeOrderForm } from "@/components/ThemeOrderForm";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { accentClasses, collectionStatusLabel } from "@/lib/format";
import { getProducts, getSeasonalCollection, getSeasonalCollections } from "@/lib/catalog";
import { SpecialCard } from "@/components/SpecialCard";
import { CandyCaneStripe, ChristmasLights, Snowfall } from "@/components/ChristmasDecor";

export async function generateStaticParams() {
  return (await getSeasonalCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/holidays/[slug]">): Promise<Metadata> {
  const holiday = await getSeasonalCollection((await params).slug);
  return holiday ? { title: `${holiday.name} Candy Favours`, description: holiday.description } : {};
}

// Same shape as an occasion page: banner, then themes + short order form.
export default function HolidayPage({ params }: PageProps<"/holidays/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HolidayContent params={params} />
    </Suspense>
  );
}

async function HolidayContent({ params }: { params: PageProps<"/holidays/[slug]">["params"] }) {
  const holiday = await getSeasonalCollection((await params).slug);
  if (!holiday) notFound();
  const a = accentClasses[holiday.accent];
  const closed = holiday.status === "closed";
  // Set-price products for this holiday (e.g. the Christmas advent calendar).
  const ids = holiday.productIds ?? [];
  const readyToOrder = ids.length ? (await getProducts()).filter((p) => ids.includes(p.id)) : [];
  // Christmas gets snow, lights and red + green colours (Vee, 2026-11-05).
  const xmas = holiday.slug === "christmas";

  return (
    <>
      {xmas && <Snowfall />}
      <section className={xmas ? "relative bg-holiday-green-soft" : a.soft}>
        {xmas && <ChristmasLights className="absolute inset-x-0 top-0" />}
        <Container className={`grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 ${xmas ? "pt-16 sm:pt-20" : ""}`}>
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-soft">
              <Link href="/occasions" className="hover:text-ink">Occasions</Link> <span aria-hidden>/</span>{" "}
              <Link href="/occasions/holidays" className="hover:text-ink">Holidays</Link> <span aria-hidden>/</span> {holiday.name}
            </nav>
            <Eyebrow>{collectionStatusLabel[holiday.status]}</Eyebrow>
            <h1 className={`text-4xl font-semibold sm:text-5xl ${xmas ? "text-holiday-red text-pop sm:text-6xl" : ""}`}>{holiday.name}</h1>
            <p className="mt-4 text-lg text-ink-soft">{holiday.description}</p>
            {holiday.orderCutoff && <p className="mt-3 font-extrabold">Order by {holiday.orderCutoff}</p>}
            {!closed && <ButtonLink href="#order" className="mt-7">Order {holiday.name} favours</ButtonLink>}
          </div>
          <PhotoPlaceholder accent={holiday.accent} className="aspect-[4/3] bg-white/40" label={`${holiday.name} photo coming soon`} />
        </Container>
      </section>
      {xmas && <CandyCaneStripe />}

      {readyToOrder.length > 0 && (
        <section aria-labelledby="ready-title" className={xmas ? "bg-holiday-red-soft" : "border-b-[3px] border-dashed border-ink/15"}>
          <Container className="py-14">
            <Eyebrow>Ready to order</Eyebrow>
            <h2 id="ready-title" className={`text-3xl font-semibold sm:text-4xl ${xmas ? "text-holiday-green-deep" : ""}`}>{holiday.name} specials</h2>
            <div className="mt-8 grid gap-8">
              {readyToOrder.map((p) => (
                <SpecialCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
      {xmas && readyToOrder.length > 0 && <CandyCaneStripe />}

      <section id="order" className="scroll-mt-28">
        <Container className="py-14">
          {closed ? (
            <div className="text-center">
              <h2 className="text-3xl font-semibold">{holiday.name} orders are closed for the season.</h2>
              <p className="mx-auto mt-3 max-w-lg text-lg text-ink-soft">Planning something else? We can still make it custom.</p>
              <ButtonLink href="/custom-orders" className="mt-6">Request a Custom Order</ButtonLink>
            </div>
          ) : (
            <ThemeOrderForm occasion={holiday.name} themes={holiday.themes} accent={holiday.accent} />
          )}
        </Container>
      </section>
    </>
  );
}
