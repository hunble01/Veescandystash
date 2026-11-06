import type { CSSProperties } from "react";

// Candy sprinkles scattered over the top of a page, fading out as they go down (Vee, 2026-11-05, Occasions page). Brand colours only. Positions
// come from a fixed seed so the server and browser draw the same picture.
// Decoration only: hidden from screen readers and never blocks taps.

const colours = ["var(--color-pink)", "var(--color-orange)", "var(--color-teal)"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Sprinkle = { left: number; top: number; rotate: number; length: number; colour: string };

// Scattered all over but never clumpy (Vee, 2026-11-05): a grid of cells,
// most with one sprinkle placed randomly inside it. `clear` is the area kept
// empty behind the words: [top, bottom, left, right] in %.
function scatter(clear: [number, number, number, number]): Sprinkle[] {
  const rand = seeded(20261105);
  const COLS = 7;
  const ROWS = 8;
  const out: Sprinkle[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const keep = rand() < 0.8;
      const left = ((col + 0.15 + rand() * 0.7) / COLS) * 100;
      const top = ((row + 0.15 + rand() * 0.7) / ROWS) * 100;
      const rotate = rand() * 180;
      const length = 14 + rand() * 8;
      if (!keep) continue;
      if (top > clear[0] && top < clear[1] && left > clear[2] && left < clear[3]) continue;
      out.push({ left, top, rotate, length, colour: colours[out.length % colours.length] });
    }
  }
  return out;
}

// Phones: the words fill the width, so keep a full-width band clear.
// Bigger screens: the words sit in the middle, so only the middle is clear.
const phone = scatter([9, 44, 2, 98]);
const wide = scatter([4, 45, 30, 70]);

function Layer({ items, className }: { items: Sprinkle[]; className: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {items.map((s, i) => (
        <span
          key={i}
          className="absolute block rounded-full border-[1.5px] border-ink/70"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.length,
              height: 7,
              background: s.colour,
              transform: `rotate(${s.rotate}deg)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function Sprinkles({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`}
      style={{ maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }}
    >
      <Layer items={phone} className="sm:hidden" />
      <Layer items={wide} className="hidden sm:block" />
    </div>
  );
}
