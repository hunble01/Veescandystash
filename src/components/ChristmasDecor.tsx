import type { CSSProperties } from "react";

// Christmas page decorations (Vee, 2026-11-05: "snow flakes and some red and
// green"). Decoration only: hidden from screen readers, never blocks taps,
// and the snow stops for visitors who prefer reduced motion.

// Fixed positions/timings (not random) so the page renders the same on the
// server and in the browser.
const flakes = [
  [3, 9, 0, 14], [9, 13, -4, 10], [15, 11, -8, 18], [21, 15, -2, 12], [27, 10, -6, 16],
  [33, 14, -11, 11], [39, 12, -3, 20], [45, 16, -9, 13], [51, 10, -1, 17], [57, 13, -7, 12],
  [63, 11, -12, 19], [69, 15, -5, 14], [75, 9, -10, 11], [81, 14, -2, 16], [87, 12, -8, 13],
  [93, 10, -4, 18], [6, 17, -13, 15], [36, 18, -15, 12], [66, 17, -14, 20], [96, 16, -6, 10],
] as const;

// `contained` keeps the snow inside its parent section (which needs
// `relative overflow-hidden`) instead of falling over the whole page.
export function Snowfall({ contained = false }: { contained?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none inset-0 overflow-hidden motion-reduce:hidden ${contained ? "absolute z-0" : "fixed z-30"}`}>
      {flakes.map(([left, dur, delay, size], i) => (
        <span
          key={i}
          className="snowflake absolute -top-8 block"
          style={{ left: `${left}%`, width: size + 10, height: size + 10, animationDuration: `${dur}s`, animationDelay: `${delay}s` } as CSSProperties}
        >
          <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-[0_0_2px_rgb(43_29_23/0.7)]">
            <g stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
              <path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10" />
              <path d="M9.5 3.8 12 6l2.5-2.2M9.5 20.2 12 18l2.5 2.2" />
            </g>
          </svg>
        </span>
      ))}
    </div>
  );
}

// Red and white candy-cane stripe, used as a border between sections.
export function CandyCaneStripe({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-4 border-y-[3px] border-ink ${className}`}
      style={{ background: "repeating-linear-gradient(-45deg, var(--color-holiday-red) 0 14px, #fff 14px 28px)" }}
    />
  );
}

// A string of red and green Christmas lights drooping across the top.
export function ChristmasLights({ className = "" }: { className?: string }) {
  const bulbs = Array.from({ length: 13 }, (_, i) => i);
  return (
    <svg aria-hidden viewBox="0 0 1200 70" preserveAspectRatio="none" className={`h-12 w-full sm:h-16 ${className}`}>
      <path d="M0 8 Q 50 40 100 8 T 200 8 T 300 8 T 400 8 T 500 8 T 600 8 T 700 8 T 800 8 T 900 8 T 1000 8 T 1100 8 T 1200 8" fill="none" stroke="var(--color-ink)" strokeWidth="3" />
      {bulbs.map((i) => {
        const x = 50 + i * 100 - 50 * (i === 12 ? 1 : 0);
        if (x > 1180) return null;
        const colour = ["var(--color-holiday-red)", "var(--color-holiday-green)", "var(--color-holiday-gold)"][i % 3];
        return (
          <g key={i} transform={`translate(${x} 24)`} className="christmas-bulb" style={{ animationDelay: `${(i % 3) * 0.6}s` } as CSSProperties}>
            <rect x="-5" y="-2" width="10" height="8" rx="2" fill="var(--color-ink)" />
            <ellipse cx="0" cy="18" rx="10" ry="14" fill={colour} stroke="var(--color-ink)" strokeWidth="3" />
            <ellipse cx="-3" cy="13" rx="3" ry="5" fill="#fff" opacity="0.5" />
          </g>
        );
      })}
    </svg>
  );
}
