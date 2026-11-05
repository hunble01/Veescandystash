import type { CSSProperties } from "react";
import { GummyBear, Lollipop, PeachRing, Sparkle, WrappedCandy, candyColours } from "@/components/Candies";
import { ButtonLink, Container, Squiggle } from "@/components/ui";
import { site } from "@/config/site";

// "Come join in on more fun!": a big, bold social band so the follow links
// grab attention (Vee's request, 2026-10-29). Shown on the About page and on
// the home page under "How it works". A full-width pink band with wavy,
// icing-like edges (Vee, 2026-10-30: no boxy look), candies scattered over
// it and arrows pointing at the buttons.

// Small social glyphs. Shapes only, in the button's text colour.
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const socialLinks = [
  { label: "Instagram", url: site.social.instagram, Icon: InstagramIcon },
  { label: "TikTok", url: site.social.tiktok, Icon: TikTokIcon },
];

// Candies scattered over the band, some peeking past the waves. On pink,
// pink candies would vanish, so those get another brand colour.
const floaters = [
  { Candy: GummyBear, className: "-top-6 left-[4%] w-12 sm:w-20", r: "-12deg", dur: "6s" },
  { Candy: Lollipop, className: "-top-8 right-[6%] w-11 sm:w-16", r: "14deg", dur: "7s" },
  { Candy: PeachRing, className: "-bottom-8 left-[10%] w-14 sm:w-20", r: "8deg", dur: "6.5s" },
  { Candy: WrappedCandy, className: "right-[3%] -bottom-6 w-14 sm:w-24", r: "-10deg", dur: "5.5s", c: candyColours.teal },
  { Candy: Sparkle, className: "top-1/3 left-[6%] hidden w-10 md:block", r: "0deg", dur: "4s", c: candyColours.cream },
  { Candy: Sparkle, className: "top-1/2 right-[8%] hidden w-7 md:block", r: "0deg", dur: "5s", c: candyColours.teal },
] as const;

// Wavy icing edge: pink fill with an ink line along the wave. Drawn for the
// top of the band; the bottom one is the same turned upside down.
const WAVES = 12; // half-waves across the band, each 100 units wide
const waveLine = `M0 20 Q50 2 100 20 ${Array.from({ length: WAVES - 1 }, (_, i) => `T${(i + 2) * 100} 20`).join(" ")}`;

function Wave({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${WAVES * 100} 40`} preserveAspectRatio="none" className={`block h-6 w-full sm:h-9 ${className}`}>
      <path d={`${waveLine} L${WAVES * 100} 40 L0 40 Z`} fill="var(--color-pink-light)" />
      <path d={waveLine} fill="none" stroke="var(--color-ink)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Hand-drawn arrows: white with an ink outline so they read on pink. The
// curly one loops, then runs straight into an arrowhead pointing right.
function CurlyArrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 60" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {["var(--color-ink)", "#fff"].map((stroke, i) => (
        <g key={stroke} stroke={stroke} strokeWidth={i === 0 ? 12 : 6}>
          <path d="M6 10C26 2 40 14 32 26c-6 10-20 4-12-4 10-10 30 22 70 22" />
          <path d="M78 32l14 12-14 12" />
        </g>
      ))}
    </svg>
  );
}

function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 30 44" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {["var(--color-ink)", "#fff"].map((stroke, i) => (
        <g key={stroke} stroke={stroke} strokeWidth={i === 0 ? 11 : 5.5}>
          <path d="M15 5v30M5 25l10 12 10-12" />
        </g>
      ))}
    </svg>
  );
}

export function JoinTheFun({ className = "" }: { className?: string }) {
  return (
    <div data-reveal className={`relative overflow-x-clip ${className}`}>
      <div className="relative">
        <Wave />
        <section aria-labelledby="join-fun" className="-my-px bg-pink-light py-12 text-center sm:py-16">
          <Container>
            <span className="inline-block -rotate-3 rounded-full border-[3px] border-ink bg-teal px-4 py-1 text-sm font-extrabold tracking-wide text-ink uppercase">
              Psst! Follow along
            </span>
            <h2 id="join-fun" className="mt-5 font-display text-4xl leading-tight uppercase text-orange [text-shadow:3px_3px_0_var(--color-ink)] sm:text-6xl">
              Come join in on more{" "}
              <span className="relative inline-block text-teal">
                fun!
                <Squiggle className="text-white" />
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg font-bold text-ink sm:text-xl">
              Sweet new mixes, party favour ideas and little peeks behind the stash.
            </p>

            {/* Phones: arrows point down at the stacked buttons. */}
            <p aria-hidden className="mt-7 flex items-center justify-center gap-3 font-display text-xl whitespace-nowrap text-white [text-shadow:2px_2px_0_var(--color-ink)] sm:hidden">
              <ArrowDown className="w-8 animate-bounce" />
              Tap to follow!
              <ArrowDown className="w-8 animate-bounce [animation-delay:-0.5s]" />
            </p>

            {/* Links switch on once Vee adds her handles under social in src/config/site.ts. */}
            <div className="mt-3 flex items-center justify-center gap-2 sm:mt-10">
              <CurlyArrow className="hidden w-24 shrink-0 animate-nudge-x sm:block" />
              <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                {socialLinks.map(({ label, url, Icon }) =>
                  url ? (
                    <ButtonLink
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-14 gap-3 px-7 text-lg transition hover:animate-wiggle sm:w-auto"
                    >
                      <Icon className="h-7 w-7 shrink-0" />
                      {label}
                    </ButtonLink>
                  ) : (
                    <span
                      key={label}
                      className="inline-flex w-full min-h-14 items-center justify-center gap-3 rounded-full border-[3px] border-dashed border-ink/60 bg-white/85 px-7 text-lg font-extrabold text-ink-soft sm:w-auto"
                    >
                      <Icon className="h-7 w-7 shrink-0 text-ink" />
                      {label} <span className="text-sm font-bold whitespace-nowrap">· coming soon</span>
                    </span>
                  ),
                )}
              </div>
              <CurlyArrow className="hidden w-24 shrink-0 -scale-x-100 animate-nudge-x [--nudge:-8px] sm:block" />
            </div>
          </Container>
        </section>
        <Wave className="rotate-180" />

        {floaters.map(({ Candy, className, r, dur, ...colour }, i) => (
          <div key={i} aria-hidden className={`pointer-events-none absolute ${className}`}>
            <div className="animate-float drop-shadow-[0_8px_6px_rgb(43_29_23/0.15)]" style={{ "--r": r, animationDuration: dur, animationDelay: `${i * -0.8}s` } as CSSProperties}>
              <Candy className="h-auto w-full" {...("c" in colour ? { c: colour.c } : {})} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
