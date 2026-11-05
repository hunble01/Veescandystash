import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Sparkle, candyColours } from "./Candies";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

type Variant = "primary" | "secondary" | "ghost";

// Chunky retro buttons: ink outline, offset shadow that "presses" on click.
const variants: Record<Variant, string> = {
  primary:
    "border-[3px] border-ink bg-orange text-ink shadow-[var(--shadow-pop)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop-lg)] active:translate-x-1 active:translate-y-1 active:shadow-none",
  secondary:
    "border-[3px] border-ink bg-white text-ink shadow-[var(--shadow-pop)] hover:-translate-y-0.5 hover:bg-pink-soft hover:shadow-[var(--shadow-pop-lg)] active:translate-x-1 active:translate-y-1 active:shadow-none",
  ghost: "text-teal-deep underline decoration-2 underline-offset-4 hover:decoration-wavy",
};

const base =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-7 font-extrabold tracking-tight transition-all duration-150";

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${className}`}
      {...props}
    />
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mb-3 inline-flex items-center gap-2 text-sm font-extrabold tracking-[0.18em] text-pink-deep uppercase ${className}`}>
      <Sparkle c={candyColours.pink} className="w-3.5" />
      {children}
    </p>
  );
}

// Hand-drawn squiggle under a highlighted word.
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 20" preserveAspectRatio="none" className={`absolute -bottom-3 left-0 h-3 w-full ${className}`}>
      <path d="M2 12c18-10 30 8 48 0s30-10 48 0 30 8 48 0 30-10 50 0" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div data-reveal className={`mb-10 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[clamp(2.2rem,7vw,3.75rem)]">{title}</h2>
      {intro && <p className="mt-4 text-lg font-medium text-ink-soft">{intro}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-1/2 -right-1/3 -z-10 aspect-square w-[140vmax] sm:-right-1/4 sm:w-[110vmax]">
        <div className="sunburst h-full w-full animate-spin-slow [--ray-a:var(--color-pink-soft)]" />
      </div>
      <Container className="py-14 sm:py-20">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="max-w-3xl text-[clamp(2.6rem,9vw,5rem)]">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg font-medium text-ink-soft sm:text-xl">{intro}</p>}
      </Container>
    </div>
  );
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${className}`}>
      {children}
    </span>
  );
}

// Marks content that is waiting on the owner. Remove once real content is in.
export function DraftNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl border-2 border-dashed border-ink/30 bg-white/80 px-4 py-3 text-sm text-ink-soft">
      <span aria-hidden className="mt-0.5 rounded-full bg-ink/10 px-2 text-[11px] font-bold tracking-wide uppercase">
        Draft
      </span>
      <span>{children}</span>
    </p>
  );
}
