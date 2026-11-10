import type { CSSProperties } from "react";
import { SeasonalCard } from "./cards";
import { Container } from "./ui";
import { site } from "@/config/site";
import type { SeasonalCollection } from "@/lib/types";

const red = "var(--color-holiday-red)";
const green = "var(--color-holiday-green)";

function Snowflake({ c, className = "", style }: { c: string; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" className={className} style={style}>
      {[0, 60, 120].map((r) => (
        <g key={r} transform={`rotate(${r} 24 24)`}>
          <path d="M24 3v42" />
          <path d="M18 8l6 5 6-5M18 40l6-5 6 5" />
        </g>
      ))}
    </svg>
  );
}

// Scattered flakes: position, size, colour and float delay.
const flakes: { cls: string; c: string; delay: string }[] = [
  { cls: "top-2 left-[4%] w-16", c: red, delay: "0s" },
  { cls: "top-4 left-[24%] w-10", c: green, delay: "-2s" },
  { cls: "top-2 left-[48%] w-14", c: green, delay: "-4s" },
  { cls: "top-5 right-[26%] w-12", c: red, delay: "-1s" },
  { cls: "top-2 right-[5%] w-16", c: green, delay: "-5s" },
  { cls: "top-1/2 left-[2%] w-12", c: green, delay: "-3s" },
  { cls: "top-[45%] right-[2%] w-14", c: red, delay: "-6s" },
  { cls: "bottom-10 left-[10%] w-16", c: red, delay: "-2.5s" },
  { cls: "bottom-6 left-[38%] w-10", c: green, delay: "-4.5s" },
  { cls: "bottom-12 right-[30%] w-[4.5rem]", c: green, delay: "-1.5s" },
  { cls: "bottom-8 right-[8%] w-12", c: red, delay: "-3.5s" },
];

// Christmas-themed seasonal band: white with red and green snowflakes, no
// ticker ribbons (Vee's requests, 2026-10-27). Shared by the Occasions and Holidays pages.
export function HolidayBand({ collections, title, intro }: { collections: SeasonalCollection[]; title: string; intro?: string }) {
  if (collections.length === 0) return null;
  // The upcoming holiday (site.featuredHoliday) goes first, as a wide card.
  const featured = collections.find((c) => c.slug === site.featuredHoliday);
  const rest = collections.filter((c) => c !== featured);
  return (
    <section id="seasonal" aria-labelledby="seasonal-title" className="relative scroll-mt-28">
      <div className="relative isolate overflow-hidden bg-white py-20 sm:py-24">
        {flakes.map((f, i) => (
          <Snowflake key={i} c={f.c} className={`pointer-events-none absolute -z-10 animate-float opacity-80 ${f.cls}`} style={{ animationDelay: f.delay }} />
        ))}

        <Container className="relative">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold tracking-[0.18em] text-holiday-red uppercase">
              <Snowflake c={green} className="w-4" />
              Seasonal drops
            </p>
            <h2 id="seasonal-title" className="text-[clamp(2.6rem,8vw,4.5rem)] leading-none">{title}</h2>
            {intro && <p className="mt-5 text-lg font-medium text-ink-soft sm:text-xl">{intro}</p>}
          </div>
          {featured && (
            <div className="mb-8">
              <SeasonalCard collection={featured} index={1} featured />
            </div>
          )}
          {/* Flex rather than grid so a short last row sits centred. */}
          <div className="flex flex-wrap justify-center gap-6">
            {rest.map((c, i) => (
              <div key={c.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                <SeasonalCard collection={c} index={i + (featured ? 2 : 0)} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
