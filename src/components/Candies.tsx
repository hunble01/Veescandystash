// Decorative candy illustrations in brand colours only. These are generic
// candy shapes for atmosphere, not product images and not a logo.

import type { SVGProps } from "react";

export const candyColours = {
  orange: "#f2762e",
  pink: "#ef6f9f",
  teal: "#6dd3ca",
  cream: "#fff6ea",
  ink: "#2b1d17",
} as const;

type CandyProps = SVGProps<SVGSVGElement> & { c?: string; c2?: string };

const shine = { fill: "#fff", opacity: 0.45 };

export function GummyBear({ c = candyColours.orange, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 100 124" aria-hidden {...p}>
      {/* Drawn twice: thick ink pass for one clean outline, then the fill. */}
      {[{ stroke: candyColours.ink, strokeWidth: 6, fill: candyColours.ink }, { fill: c }].map((style, i) => (
        <g key={i} {...style}>
          <circle cx="28" cy="16" r="11" />
          <circle cx="72" cy="16" r="11" />
          <ellipse cx="50" cy="34" rx="27" ry="23" />
          <ellipse cx="50" cy="82" rx="29" ry="31" />
          <ellipse cx="18" cy="64" rx="10" ry="15" transform="rotate(-35 18 64)" />
          <ellipse cx="82" cy="64" rx="10" ry="15" transform="rotate(35 82 64)" />
          <ellipse cx="27" cy="110" rx="14" ry="10" />
          <ellipse cx="73" cy="110" rx="14" ry="10" />
        </g>
      ))}
      <ellipse cx="38" cy="30" rx="8" ry="4" {...shine} transform="rotate(-20 38 30)" />
      <ellipse cx="36" cy="74" rx="5" ry="12" {...shine} />
      <circle cx="42" cy="38" r="2.6" fill={candyColours.ink} />
      <circle cx="58" cy="38" r="2.6" fill={candyColours.ink} />
    </svg>
  );
}

export function PeachRing({ c = candyColours.orange, c2 = candyColours.pink, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden {...p}>
      <circle cx="50" cy="50" r="34" fill="none" stroke={candyColours.ink} strokeWidth="27" />
      <circle cx="50" cy="50" r="34" fill="none" stroke={c} strokeWidth="21" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={c2} strokeWidth="7" />
      {[[20, 38], [30, 22], [52, 18], [74, 26], [82, 48], [74, 74], [50, 82], [26, 72], [18, 56]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill="#fff" opacity="0.85" />
      ))}
    </svg>
  );
}

export function SourBelt({ c = candyColours.teal, c2 = candyColours.cream, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 140 60" aria-hidden {...p}>
      <path
        d="M6 22c22-14 42 14 64 0s42-14 64 0v20c-22-14-42 14-64 0s-42-14-64 0Z"
        fill={c}
        stroke={candyColours.ink}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M8 31c22-14 42 14 62 0s42-14 62 0" fill="none" stroke={c2} strokeWidth="5" strokeLinecap="round" />
      {[[20, 22], [44, 34], [70, 22], [96, 30], [120, 24], [32, 40], [108, 42]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff" opacity="0.9" />
      ))}
    </svg>
  );
}

export function WrappedCandy({ c = candyColours.pink, c2 = candyColours.cream, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 140 70" aria-hidden {...p}>
      <g fill={c} stroke={candyColours.ink} strokeWidth="3" strokeLinejoin="round">
        <path d="M44 35 14 14l6 21-6 21Z" />
        <path d="M96 35l30-21-6 21 6 21Z" />
        <circle cx="70" cy="35" r="27" />
      </g>
      <path d="M52 20 82 58M64 12l26 34M48 36l18 24" stroke={c2} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <circle cx="70" cy="35" r="27" fill="none" stroke={candyColours.ink} strokeWidth="3" />
      <ellipse cx="58" cy="22" rx="7" ry="3.5" {...shine} transform="rotate(-30 58 22)" />
    </svg>
  );
}

// Wrapped candy with a happy face (Vee, 2026-10-30: pink and orange smiley
// candies on the Custom Orders header).
export function SmileyCandy({ c = candyColours.pink, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 140 70" aria-hidden {...p}>
      <g fill={c} stroke={candyColours.ink} strokeWidth="3" strokeLinejoin="round">
        <path d="M44 35 14 14l6 21-6 21Z" />
        <path d="M96 35l30-21-6 21 6 21Z" />
        <circle cx="70" cy="35" r="27" />
      </g>
      <ellipse cx="57" cy="20" rx="7" ry="3.5" {...shine} transform="rotate(-30 57 20)" />
      <circle cx="61" cy="31" r="3.2" fill={candyColours.ink} />
      <circle cx="79" cy="31" r="3.2" fill={candyColours.ink} />
      <ellipse cx="54" cy="40" rx="4.5" ry="2.6" fill="#fff" opacity="0.5" />
      <ellipse cx="86" cy="40" rx="4.5" ry="2.6" fill="#fff" opacity="0.5" />
      <path d="M61 40q9 10 18 0" fill="none" stroke={candyColours.ink} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Lollipop({ c = candyColours.orange, c2 = candyColours.cream, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 100 150" aria-hidden {...p}>
      <rect x="45" y="80" width="10" height="66" rx="5" fill={c2} stroke={candyColours.ink} strokeWidth="3" />
      <circle cx="50" cy="48" r="40" fill={c} stroke={candyColours.ink} strokeWidth="3" />
      <path
        d="M50 48a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0a32 32 0 0 1-64 0"
        fill="none"
        stroke={c2}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function JellyBean({ c = candyColours.pink, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 100 70" aria-hidden {...p}>
      <path
        d="M12 38C8 16 34 4 58 8s38 20 32 36c-5 14-22 12-32 10s-16 8-30 6C18 58 14 50 12 38Z"
        fill={c}
        stroke={candyColours.ink}
        strokeWidth="3"
      />
      <ellipse cx="40" cy="20" rx="14" ry="4" {...shine} transform="rotate(-8 40 20)" />
    </svg>
  );
}

export function Sparkle({ c = candyColours.teal, ...p }: CandyProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden {...p}>
      <path d="M50 2c4 30 10 40 46 48-36 8-42 18-46 48-4-30-10-40-46-48 36-8 42-18 46-48Z" fill={c} />
    </svg>
  );
}

export const candyShapes = [GummyBear, PeachRing, SourBelt, WrappedCandy, Lollipop, JellyBean] as const;
export const candyPalette = [candyColours.orange, candyColours.pink, candyColours.teal] as const;
