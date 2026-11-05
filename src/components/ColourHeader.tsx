import { GummyBear, SmileyCandy, candyColours as k } from "./Candies";
import { Container, Squiggle } from "./ui";

// Small, calm, left-aligned page header with colourful words and no black
// lettering (Vee, 2026-10-30): no background band, a few tiny candies by the
// tag line, a squiggle under the pink words and a dashed line underneath so
// it reads as the page heading. Used on Build Your Stash and Occasions. The title is orange with
// the highlighted words in pink.
export function ColourHeader({ tag, title, highlight, intro }: { tag: string; title: string; highlight: string; intro?: string }) {
  return (
    <section>
      <Container className="border-b-[3px] border-dashed border-ink/15 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-pink-deep uppercase">
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
        {intro && <p className="mt-6 max-w-2xl text-base font-bold text-pink-deep sm:text-lg">{intro}</p>}
      </Container>
    </section>
  );
}
