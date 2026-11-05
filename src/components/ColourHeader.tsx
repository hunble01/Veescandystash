import { GummyBear, SmileyCandy, candyColours as k } from "./Candies";
import { Container, Squiggle } from "./ui";

// Small, calm, left-aligned page header with colourful words and no black
// lettering (Vee, 2026-10-30): no background band, a few tiny candies by the
// tag line, a squiggle under the pink words and a dashed line underneath so
// it reads as the page heading. Used on Build Your Stash and Occasions. The title is orange with
// the highlighted words in pink.
//
// `stacked` (Occasions, Vee 2026-11-04): same words, but the orange line sits
// on top and the pink words go underneath, much bigger, in the logo-style
// script (like "Stash" on the home page), with confetti sprinkles around them.
export function ColourHeader({
  tag,
  title,
  highlight,
  intro,
  stacked = false,
}: {
  tag: string;
  title: string;
  highlight: string;
  intro?: string;
  stacked?: boolean;
}) {
  return (
    <section>
      <Container className="border-b-[3px] border-dashed border-ink/15 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-pink-deep uppercase">
          <SmileyCandy c={k.orange} className="w-7" />
          {tag}
          <GummyBear c={k.pink} className="w-4 rotate-12" />
        </p>
        {stacked ? (
          <h1 className="mt-3 text-orange">
            <span className="block text-[clamp(1.8rem,6vw,2.75rem)] leading-tight">{title}</span>
            <span className="relative mt-1 inline-block -rotate-2 pr-4 font-logo text-[clamp(3.6rem,15vw,7.5rem)] leading-[1.1] text-pink text-pop">
              {highlight}
              <Squiggle className="text-teal" />
              <Confetti />
            </span>
          </h1>
        ) : (
          <h1 className="mt-2 text-[clamp(2.1rem,8vw,3.5rem)] leading-none text-orange">
            {title} <span className="relative inline-block -rotate-2 text-pink text-pop">
              {highlight}
              <Squiggle className="text-teal" />
            </span>
          </h1>
        )}
        {intro && <p className="mt-6 max-w-2xl text-base font-bold text-pink-deep sm:text-lg">{intro}</p>}
      </Container>
    </section>
  );
}

// Party sprinkles scattered around the big pink words. Decoration only.
const sprinkles = [
  { cls: "-top-2 left-[8%] rotate-[30deg] bg-orange", w: "w-5" },
  { cls: "top-[18%] -right-3 -rotate-[20deg] bg-teal", w: "w-6" },
  { cls: "-top-4 left-[46%] rotate-[70deg] bg-teal", w: "w-4" },
  { cls: "top-[10%] right-[22%] -rotate-[40deg] bg-orange", w: "w-4" },
  { cls: "bottom-[8%] -right-6 rotate-[15deg] bg-pink", w: "w-5" },
  { cls: "bottom-[30%] -left-5 -rotate-[60deg] bg-teal", w: "w-4" },
];
const dots = [
  { cls: "-top-3 left-[28%] bg-pink" },
  { cls: "top-[2%] right-[8%] bg-orange" },
  { cls: "bottom-[14%] right-[30%] bg-teal hidden sm:block" },
];

function Confetti() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 [text-shadow:none]">
      {sprinkles.map((s, i) => (
        <span key={i} className={`absolute block h-2 rounded-full border-2 border-ink ${s.w} ${s.cls}`} />
      ))}
      {dots.map((d, i) => (
        <span key={`d${i}`} className={`absolute block h-3 w-3 rounded-full border-2 border-ink ${d.cls}`} />
      ))}
    </span>
  );
}
