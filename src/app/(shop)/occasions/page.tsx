import type { Metadata } from "next";
import { OccasionTile } from "@/components/cards";
import { HolidayBand } from "@/components/HolidayBand";
import { ColourHeader } from "@/components/ColourHeader";
import { ButtonLink, Container } from "@/components/ui";
import { getOccasions, getSeasonalCollections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop by Occasion",
  description: "Candy favours for birthdays, baby showers, gender reveals, graduations, holidays and more.",
};

export default async function OccasionsPage() {
  const [occasions, seasonalCollections] = await Promise.all([getOccasions(), getSeasonalCollections()]);
  return (
    <>
      <ColourHeader
        tag="Shop by occasion"
        title="Made sweeter for your"
        highlight="celebration!"
        stacked
        intro="We have themed favours planned and ready for every holiday and occasion. Want something different? We’ll make a custom order just for you."
      />
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* The Holidays tile is left out here: the holiday band below covers it (Vee, 2026-10-27). */}
          {occasions.filter((o) => o.slug !== "holidays").map((o, i) => (
            <OccasionTile key={o.id} occasion={o} index={i} />
          ))}
        </div>
      </Container>

      <HolidayBand collections={seasonalCollections} title="Holiday stashes." intro="We have themes planned for every holiday, ready for you to order. Tap a holiday to see them." />

      <Container className="py-14 text-center">
        <h2 className="text-3xl font-semibold">Don’t see your occasion?</h2>
        <p className="mx-auto mt-3 max-w-lg text-lg text-ink-soft">We love a good excuse to celebrate. Tell us what you’re planning.</p>
        <ButtonLink href="/custom-orders" className="mt-6">Request a Custom Order</ButtonLink>
      </Container>
    </>
  );
}
