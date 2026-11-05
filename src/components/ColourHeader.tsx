import type { ReactNode } from "react";
import { GummyBear, Lollipop, SmileyCandy, candyColours as k } from "./Candies";
import { Container, Squiggle } from "./ui";

// Small, calm page header with colourful words and no black lettering (Vee,
// 2026-10-30): no background band, a few tiny candies by the tag line, a
// squiggle under the pink words and a dashed line underneath so it reads as
// the page heading. Used on Build Your Stash and Occasions. The title is
// orange with the highlighted words in pink.
//
// `centered` (Occasions, Vee 2026-11-04: "eye catching but not too much"):
// same lettering, centred, with a candy either side on wide
// screens and room for quick-link chips underneath (`children`).
export function ColourHeader({
  tag,
  title,
  highlight,
  intro,
  centered = false,
  children,
}: {
  tag: string;
  title: string;
  highlight: string;
  intro?: string;
  centered?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={centered ? "relative overflow-hidden" : undefined}>
      {centered && (
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
          <GummyBear c={k.orange} className="absolute top-[44%] left-[2%] w-16 animate-float [--r:-12deg]" />
          <Lollipop c={k.pink} className="absolute top-[40%] right-[2.5%] w-14 animate-float [--r:12deg] [animation-delay:-2s]" />
        </div>
      )}
      <Container
        className={`relative border-b-[3px] border-dashed border-ink/15 pt-10 pb-8 sm:pt-14 sm:pb-10 ${centered ? "text-center" : ""}`}
      >
        <p
          className={`flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-pink-deep uppercase ${centered ? "justify-center" : ""}`}
        >
          <SmileyCandy c={k.orange} className="w-7" />
          {tag}
          <GummyBear c={k.pink} className="w-4 rotate-12" />
        </p>
        <h1 className="mt-2 text-[clamp(2.1rem,8vw,3.5rem)] leading-none text-orange">
          {title} <span className="relative inline-block -rotate-2 text-pink text-pop">
            {highlight}
            <Squiggle className="text-teal" />
          </span>
        </h1>
        {intro && (
          <p className={`mt-6 max-w-2xl text-base font-bold text-pink-deep sm:text-lg ${centered ? "mx-auto" : ""}`}>{intro}</p>
        )}
        {children}
      </Container>
    </section>
  );
}
