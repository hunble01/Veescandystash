import Image from "next/image";
import { Sparkle } from "@/components/Candies";
import { occasionIcons } from "@/data/occasionCollages";
import { accentClasses } from "@/lib/format";
import type { Accent } from "@/lib/types";

// Gender reveals: a heart that's half pink, half blue (Vee, 2026-11-05).
function SplitHeart({ className = "" }: { className?: string }) {
  const heart = "M50 88C22 68 6 52 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 20-16 36-44 56Z";
  return (
    <svg viewBox="0 0 100 96" className={className}>
      <defs>
        <clipPath id="split-heart-left">
          <rect x="0" y="0" width="50" height="96" />
        </clipPath>
      </defs>
      <path d={heart} fill="#7ec8f0" />
      <path d={heart} fill="#f48fb1" clipPath="url(#split-heart-left)" />
      <path d={heart} fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="28" cy="28" rx="7" ry="10" fill="#fff" opacity="0.45" transform="rotate(-30 28 28)" />
    </svg>
  );
}

// Baptisms + dedications: a simple rounded cross (Vee, 2026-11-05).
function Cross({ c, className = "" }: { c: string; className?: string }) {
  return (
    <svg viewBox="0 0 70 100" className={className}>
      <path
        d="M27 4h16a3 3 0 0 1 3 3v19h17a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H46v47a3 3 0 0 1-3 3H27a3 3 0 0 1-3-3V46H7a3 3 0 0 1-3-3V29a3 3 0 0 1 3-3h17V7a3 3 0 0 1 3-3Z"
        fill={c}
        stroke="var(--color-ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="29" y="9" width="5" height="30" rx="2.5" fill="#fff" opacity="0.45" />
    </svg>
  );
}

// Picture beside an occasion/holiday heading: the owner's photo when there
// is one, otherwise a big sticker-style icon (Vee, 2026-11-05: "put an icon
// or something to fill each space"). Never a "photo coming soon" frame.
export function OccasionPicture({ slug, name, accent, banner }: { slug: string; name: string; accent: Accent; banner?: string | null }) {
  if (banner) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink shadow-[var(--shadow-pop-lg)]">
        <Image src={banner} alt={`${name} candy favours`} fill sizes="(min-width: 1024px) 560px, 92vw" className="object-cover" />
      </div>
    );
  }
  const icon = occasionIcons[slug];
  if (!icon) return null;
  const a = accentClasses[accent];
  return (
    <div aria-hidden className="relative mx-auto grid aspect-square w-52 place-items-center sm:w-64 lg:w-80">
      <span className={`absolute inset-0 rounded-full opacity-25 ${a.solid}`} />
      <span className="absolute inset-[12%] -rotate-6 rounded-full border-[3px] border-ink bg-white shadow-[var(--shadow-pop-lg)]" />
      {icon === "split-heart" ? (
        <SplitHeart className="relative w-[48%] animate-float" />
      ) : icon === "cross" ? (
        <Cross c={a.dot} className="relative w-[34%] animate-float" />
      ) : (
        <span className="relative animate-float text-[5.5rem] leading-none sm:text-[7rem] lg:text-[8.5rem]">{icon}</span>
      )}
      <Sparkle c={a.dot} className="absolute top-[6%] right-[8%] w-8 sm:w-10" />
      <Sparkle c={a.dot} className="absolute bottom-[10%] left-[4%] w-6 sm:w-7" />
    </div>
  );
}
