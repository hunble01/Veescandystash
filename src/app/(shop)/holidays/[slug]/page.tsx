import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ThemeOrderForm } from "@/components/ThemeOrderForm";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { accentClasses, collectionStatusLabel } from "@/lib/format";
import { getSeasonalCollection, getSeasonalCollections } from "@/lib/catalog";

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

  return (
    <>
      <section className={a.soft}>
        <Container className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-soft">
              <Link href="/occasions" className="hover:text-ink">Occasions</Link> <span aria-hidden>/</span>{" "}
              <Link href="/occasions/holidays" className="hover:text-ink">Holidays</Link> <span aria-hidden>/</span> {holiday.name}
            </nav>
            <Eyebrow>{collectionStatusLabel[holiday.status]}</Eyebrow>
            <h1 className="text-4xl font-semibold sm:text-5xl">{holiday.name}</h1>
            <p className="mt-4 text-lg text-ink-soft">{holiday.description}</p>
            {holiday.orderCutoff && <p className="mt-3 font-extrabold">Order by {holiday.orderCutoff}</p>}
            {!closed && <ButtonLink href="#order" className="mt-7">Order {holiday.name} favours</ButtonLink>}
          </div>
          <PhotoPlaceholder accent={holiday.accent} className="aspect-[4/3] bg-white/40" label={`${holiday.name} photo coming soon`} />
        </Container>
      </section>

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
