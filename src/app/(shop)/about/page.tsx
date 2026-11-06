import type { Metadata } from "next";
import { JoinTheFun } from "@/components/JoinTheFun";
import Image from "next/image";
import { GummyBear, JellyBean, Lollipop, PeachRing, SmileyCandy, Sparkle, WrappedCandy, candyColours as k } from "@/components/Candies";
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
        {/* Cartoon of Vee until she takes a real photo (2026-11-05): light skin,
            medium dark-brown curly hair, pink apron. Swap for a photo later. */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink bg-orange-soft shadow-[var(--shadow-pop-lg)]">
          <Image src="/vee-illustration.svg" alt="Cartoon drawing of Vee in her pink apron" fill sizes="(min-width: 1024px) 520px, 92vw" className="object-cover" unoptimized />
          {/* Vee's real logo as a patch on the apron (2026-11-05) */}
          {site.logo && (
            <Image
              src={site.logo.src}
              alt=""
              width={site.logo.width}
              height={site.logo.height}
              className="absolute top-[72.4%] left-[38%] w-[24%] -rotate-6 rounded-full border-[3px] border-ink"
            />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Lollipop c={k.orange} className="absolute top-[6%] left-[6%] w-[16%] -rotate-12" />
            <WrappedCandy c={k.teal} className="absolute top-[10%] right-[6%] w-[18%] rotate-12" />
            <GummyBear c={k.pink} className="absolute top-[40%] left-[4%] w-[11%] -rotate-6" />
            <PeachRing className="absolute top-[38%] right-[5%] w-[13%] rotate-6" />
            <JellyBean c={k.orange} className="absolute top-[24%] left-[12%] w-[7%] rotate-45" />
            <SmileyCandy c={k.teal} className="absolute top-[26%] right-[7%] w-[9%]" />
            <Sparkle c={k.pink} className="absolute top-[3%] left-[44%] w-[7%]" />
          </div>
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
