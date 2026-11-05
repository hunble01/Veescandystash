import type { CSSProperties } from "react";
import { GummyBear, Lollipop, PeachRing, Sparkle, WrappedCandy, candyColours as k } from "./Candies";

// Stand-in for bag-size photos until Vee has real ones (2026-10-30): a cute
// drawn candy bag with a happy face and candies peeking out, drawn bigger for
// bigger sizes so shoppers can compare at a glance. Clearly a drawing, not a
// product photo, and not a logo. A photo added to the size in the Studio
// replaces it.
//
// scale: 0 (smallest size) to 1 (largest). The largest bag still fits inside
// the frame with its candies showing.
export function BagIllustration({ scale, label }: { scale: number; label: string }) {
  const width = 30 + scale * 24; // % of the frame
  return (
    <div
      role="img"
      aria-label={`Drawing of a ${label} candy bag`}
      className="relative flex aspect-square items-end justify-center overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-orange-soft/70 pb-[8%]"
    >
      <Sparkle c={k.pink} className="absolute top-[12%] left-[12%] w-[9%]" />
      <Sparkle c={k.teal} className="absolute top-[22%] right-[12%] w-[7%]" />

      <div className="relative" style={{ width: `${width}%` }}>
        {/* Candies peeking out of the top, tucked behind the bag */}
        <Lollipop className="absolute bottom-[80%] left-[2%] w-[34%] -rotate-12" />
        <GummyBear c={k.pink} className="absolute bottom-[84%] left-[34%] w-[30%] rotate-6" />
        <PeachRing className="absolute right-[2%] bottom-[79%] w-[34%] rotate-12" />
        {scale > 0.6 && <WrappedCandy c={k.teal} className="absolute right-[26%] bottom-[94%] w-[28%] -rotate-6" />}

        {/* The bag: white pouch, crimped pink seal, happy face */}
        <div className="relative aspect-[5/6] rounded-t-[10%] rounded-b-[30%] border-[3px] border-ink bg-white shadow-[3px_4px_0_var(--color-ink)]">
          <div className="crimp absolute inset-x-0 -top-[3px] rounded-t-[inherit]" style={{ "--c": "var(--color-pink)" } as CSSProperties} />
          <div className="absolute inset-x-0 top-[14px] h-[3px] bg-ink" />

          {/* Face */}
          <div className="absolute inset-x-0 top-[44%] flex justify-center gap-[22%]">
            <span className="aspect-[3/4] w-[10%] rounded-full bg-ink" />
            <span className="aspect-[3/4] w-[10%] rounded-full bg-ink" />
          </div>
          <div className="absolute inset-x-0 top-[56%] flex justify-center gap-[34%]">
            <span className="aspect-[2/1] w-[14%] rounded-full bg-pink/60" />
            <span className="aspect-[2/1] w-[14%] rounded-full bg-pink/60" />
          </div>
          <svg aria-hidden viewBox="0 0 20 10" className="absolute top-[57%] left-1/2 w-[20%] -translate-x-1/2">
            <path d="M3 2Q10 10 17 2" fill="none" stroke="var(--color-ink)" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
