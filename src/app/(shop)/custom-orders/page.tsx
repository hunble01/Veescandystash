import type { Metadata } from "next";
import { Suspense, type CSSProperties } from "react";
import { SmileyCandy, candyColours } from "@/components/Candies";
import { CustomOrderForm } from "./CustomOrderForm";
import { Container } from "@/components/ui";
import { getOccasions } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Custom Orders",
  description: "Request custom candy favours for your birthday, shower, graduation or event.",
};

const process = [
  { title: "Tell us about your event", body: "Occasion, date, guest count, colours and wording." },
  { title: "We send ideas + a quote", body: "Vee reviews your request and confirms details and pricing." },
  { title: "Approve and relax", body: "Once you approve, we make your favours and arrange pickup or delivery." },
];

// Small smiley candies scattered all around the header (Vee, 2026-10-30),
// pink and orange in turn. Phones get the ones along the edges only, so
// they don't cover the words.
const smileys = [
  ["top-12 left-[4%] sm:top-10", "-14deg"],
  ["top-14 right-[5%] sm:top-12", "12deg"],
  ["top-[14%] left-[30%] hidden sm:block", "8deg"],
  ["top-[10%] right-[28%] hidden sm:block", "-10deg"],
  ["top-[24%] left-[1%]", "16deg"],
  ["top-[22%] right-[1%]", "-6deg"],
  ["top-[40%] left-[12%] hidden md:block", "-12deg"],
  ["top-[42%] right-[12%] hidden md:block", "10deg"],
  ["top-[52%] left-[3%] hidden sm:block", "6deg"],
  ["top-[50%] right-[3%] hidden sm:block", "-16deg"],
  ["bottom-3 left-[6%]", "12deg"],
  ["bottom-4 right-[7%]", "-12deg"],
  ["bottom-2 left-[46%] hidden sm:block", "-8deg"],
].map(([place, r], i) => ({
  c: i % 2 ? candyColours.orange : candyColours.pink,
  className: `${place} w-10 sm:w-14`,
  r,
  dur: `${5 + (i % 4) * 0.6}s`,
}));

// Its own look, simple but unlike the other pages (Vee, 2026-10-30): a solid
// teal header with the three steps across it instead of the cream sunburst
// header, then one centred form.
export default async function CustomOrdersPage() {
  const occasions = (await getOccasions()).map((o) => ({ slug: o.slug, name: o.name }));

  return (
    <>
      <section className="relative overflow-hidden border-b-[3px] border-ink bg-teal text-center">
        {smileys.map(({ c, className, r, dur }, i) => (
          <div key={i} aria-hidden className={`pointer-events-none absolute ${className}`}>
            <div className="animate-float" style={{ "--r": r, animationDuration: dur, animationDelay: `${i * -0.9}s` } as CSSProperties}>
              <SmileyCandy c={c} className="h-auto w-full" />
            </div>
          </div>
        ))}
        <Container className="relative py-14 sm:py-20">
          <span className="inline-block -rotate-2 rounded-full border-[3px] border-ink bg-cream px-5 py-1.5 text-base font-extrabold sm:px-6 sm:text-xl tracking-wide text-ink uppercase">
            Custom orders
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.6rem,9vw,5rem)] text-white [text-shadow:3px_3px_0_var(--color-ink)]">
            Planning something sweet?
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-lg font-bold text-ink sm:text-xl">
            Tell us everything you have in mind for your event <span className="whitespace-nowrap">and we’ll make it sweet.</span>
          </p>

          <ol className="mx-auto mt-10 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
            {process.map((s, i) => (
              <li key={s.title} className="flex gap-3 rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-4 shadow-[var(--shadow-pop)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-orange font-display text-lg text-white">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-lg leading-snug font-bold">{s.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[var(--radius-card)] bg-white" />}>
            <CustomOrderForm occasions={occasions} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
