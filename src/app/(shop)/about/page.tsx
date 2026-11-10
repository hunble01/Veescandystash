import type { Metadata } from "next";
import { JoinTheFun } from "@/components/JoinTheFun";
import Image from "next/image";
import { Container, Eyebrow } from "@/components/ui";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About Vee",
  description: `The story behind ${site.name}.`,
};

export default function AboutPage() {
  return (
    <>
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        {/* Vee's real photo (2026-11-10, from her "me" folder); replaces the cartoon. */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink bg-orange-soft shadow-[var(--shadow-pop-lg)]">
          <Image src="/vee.webp" alt="Vee in her Vee’s Candy Stash apron, in front of shelves of candy jars" fill priority sizes="(min-width: 1024px) 520px, 92vw" className="object-cover object-top" />
        </div>
        <div>
          <Eyebrow>About</Eyebrow>
          <h1 className="text-4xl font-semibold text-pink sm:text-5xl">Hi, I’m Vee.</h1>
          <div className="mt-6 space-y-4 text-lg text-ink-soft">
            <p>
              {site.name} is a small candy shop in {site.region}, making sweet little bags for everyday treats and
              party favours for life’s celebrations.
            </p>
            {/* Vee's own story (2026-10-29), lightly tidied. */}
            <p>
              I’ve always kept a candy stash on hand. A little something sweet is my reward at every time of day: a
              treat with my morning coffee, a boost in the afternoon, a nibble at night.
            </p>
            <p>
              Becoming a mom in 2026 made that stash more important than ever. Some days you just need a sweet
              pick-me-up, and now I get to share mine with you.
            </p>
            <p className="font-bold text-ink">Every sweet tooth needs a stash. This one’s mine, and it can be yours too.</p>
          </div>
          <h2 className="mt-8 text-2xl font-semibold text-pink">Contact</h2>
          <dl className="mt-4 space-y-3 text-lg">
            {site.contact.phone && (
              <div>
                <dt className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">Phone</dt>
                <dd>
                  <a href={`tel:+1${site.contact.phone.replace(/\D/g, "")}`} className="font-semibold text-teal-deep underline underline-offset-4">
                    {site.contact.phone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">Email</dt>
              <dd>
                {site.contact.email ? (
                  <a href={`mailto:${site.contact.email}`} className="font-semibold text-teal-deep underline underline-offset-4">
                    {site.contact.email}
                  </a>
                ) : (
                  <span className="text-ink-soft">Coming soon</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </Container>

      <JoinTheFun className="pb-20 sm:pb-24" />
    </>
  );
}
