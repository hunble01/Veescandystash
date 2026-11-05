import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HolidayBand } from "@/components/HolidayBand";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ThemeOrderForm } from "@/components/ThemeOrderForm";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { accentClasses } from "@/lib/format";
import { getOccasion, getOccasions, getSeasonalCollections } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getOccasions()).map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/occasions/[slug]">): Promise<Metadata> {
  const occasion = await getOccasion((await params).slug);
  return occasion ? { title: `${occasion.name} Candy Favours`, description: occasion.description } : {};
}

// Wrapped in Suspense: pages added in Sanity after the last build are only
// known at request time, so the slug is read inside the boundary.
export default function OccasionPage({ params }: PageProps<"/occasions/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OccasionContent params={params} />
    </Suspense>
  );
}

async function OccasionContent({ params }: { params: PageProps<"/occasions/[slug]">["params"] }) {
  const occasion = await getOccasion((await params).slug);
  if (!occasion) notFound();
  const seasonalCollections = await getSeasonalCollections();

  const a = accentClasses[occasion.accent];
  const isHolidays = occasion.slug === "holidays";

  return (
    <>
      <section className={a.soft}>
        <Container className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-soft">
              <Link href="/occasions" className="hover:text-ink">Occasions</Link> <span aria-hidden>/</span> {occasion.shortName}
            </nav>
            <Eyebrow>{occasion.name}</Eyebrow>
            <h1 className="text-4xl font-semibold sm:text-5xl">{occasion.tagline}</h1>
            <p className="mt-4 text-lg text-ink-soft">{occasion.description}</p>
            {isHolidays ? (
              <ButtonLink href="#seasonal" className="mt-7">See holiday themes</ButtonLink>
            ) : (
              <ButtonLink href="#order" className="mt-7">
                Order {occasion.shortName.toLowerCase()} favours
              </ButtonLink>
            )}
          </div>
          <PhotoPlaceholder accent={occasion.accent} className="aspect-[4/3] bg-white/40" label={`${occasion.shortName} photo coming soon`} />
        </Container>
      </section>

      {isHolidays ? (
        <HolidayBand collections={seasonalCollections} title="This year’s holiday stashes." intro="Tap a holiday to see its themes and order." />
      ) : (
        <section id="order" className="scroll-mt-28">
          <Container className="py-14">
            <ThemeOrderForm occasion={occasion.name} themes={occasion.themes} accent={occasion.accent} />
          </Container>
        </section>
      )}
    </>
  );
}
