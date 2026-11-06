import type { CSSProperties } from "react";

// Playful page titles (Vee, 2026-11-05: Build Your Stash and Occasions titles
// "look boring"). `lead` is the smaller first part, `main` the big fun word.
export type FunTitleStyle = "bouncy" | "bubble" | "stripes" | "logo" | "sticker";

const colours = ["var(--color-pink)", "var(--color-orange)", "var(--color-teal)"];
const tilts = [-8, 5, -4, 7, -6, 10, -3, 6, -7, 4, -5, 8];
const lifts = [0, -6, 3, -4, 2, -8, 4, -3, 1, -6, 3, -2];

function Bouncy({ text }: { text: string }) {
  return (
    <span className="inline-flex flex-wrap justify-center" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block"
          style={{ color: colours[i % 3], transform: `rotate(${tilts[i % tilts.length]}deg) translateY(${lifts[i % lifts.length]}px)` }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

export function FunTitle({ lead, main, style }: { lead: string; main: string; style: FunTitleStyle }) {
  const size = "text-[clamp(2.4rem,9vw,4.25rem)] leading-none";

  if (style === "bouncy") {
    return (
      <h1 className={`${size} text-pop`}>
        <span className="text-orange">{lead} </span>
        <Bouncy text={main} />
      </h1>
    );
  }

  if (style === "bubble") {
    // Chunky bubble letters: white inside, thick dark outline, pink + orange shadow.
    const bubble: CSSProperties = {
      color: "#fff",
      WebkitTextStroke: "3px var(--color-ink)",
      paintOrder: "stroke fill",
      textShadow: "4px 4px 0 var(--color-pink), 8px 8px 0 var(--color-orange)",
    };
    return (
      <h1 className={size}>
        <span className="text-orange text-pop">{lead} </span>
        <span className="inline-block -rotate-2" style={bubble}>{main}</span>
      </h1>
    );
  }

  if (style === "stripes") {
    // Candy-stripe letters in orange and pink, outlined like a candy wrapper.
    const stripes: CSSProperties = {
      backgroundImage: "repeating-linear-gradient(-45deg, var(--color-orange) 0 10px, var(--color-pink) 10px 20px)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      WebkitTextStroke: "2px var(--color-ink)",
      filter: "drop-shadow(3px 4px 0 var(--color-ink))",
    };
    return (
      <h1 className={size}>
        <span className="text-teal text-pop">{lead} </span>
        <span className="inline-block -rotate-2" style={stripes}>{main}</span>
      </h1>
    );
  }

  if (style === "logo") {
    // Like the logo: a small script line above one big chunky word.
    return (
      <h1 className="leading-none">
        <span className="block -rotate-3 font-logo text-[clamp(1.6rem,5vw,2.4rem)] font-normal text-pink">{lead}</span>
        <span
          className="mt-1 inline-block text-[clamp(3rem,12vw,5.5rem)] text-orange"
          style={{ textShadow: "3px 4px 0 var(--color-teal), 6px 8px 0 var(--color-ink)" }}
        >
          {main}
        </span>
      </h1>
    );
  }

  // sticker: each part on its own tilted label, like stickers on a candy bag.
  return (
    <h1 className="flex flex-col items-center gap-3 leading-none">
      <span className="-rotate-2 rounded-full border-[3px] border-ink bg-pink px-5 py-1.5 text-[clamp(1.3rem,4.5vw,2rem)] text-white shadow-[4px_4px_0_var(--color-ink)]">
        {lead}
      </span>
      <span className="rotate-2 rounded-[1.25rem] border-[3px] border-ink bg-cream px-6 py-2 text-[clamp(2.4rem,9vw,4.25rem)] text-orange shadow-[6px_6px_0_var(--color-ink)]">
        {main}
      </span>
    </h1>
  );
}
