"use client";

import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import {
  GummyBear,
  JellyBean,
  Lollipop,
  PeachRing,
  SourBelt,
  Sparkle,
  WrappedCandy,
  candyColours as k,
  candyPalette,
  candyShapes,
} from "@/components/Candies";

// Floating candies around the headline. depth drives pointer parallax;
// r is the resting tilt; positions keep the centre clear for the text.
const floaters = [
  { el: <GummyBear c={k.orange} />, cls: "top-[6%] left-[-4%] w-16 sm:w-24 lg:left-[6%] lg:w-28", depth: 1.4, r: "-14deg", dur: "6s" },
  { el: <PeachRing />, cls: "top-[4%] right-[-6%] w-20 sm:w-28 lg:right-[8%] lg:w-36", depth: 0.8, r: "10deg", dur: "8s" },
  { el: <SourBelt />, cls: "top-[44%] left-[-10%] w-28 sm:w-36 lg:left-[2%] lg:w-48", depth: 1.1, r: "18deg", dur: "7s" },
  { el: <WrappedCandy c={k.teal} />, cls: "bottom-[16%] right-[-8%] w-28 sm:w-32 lg:right-[4%] lg:w-44", depth: 1.6, r: "-12deg", dur: "6.5s" },
  { el: <Lollipop c={k.pink} />, cls: "bottom-[2%] left-[4%] hidden w-20 sm:block lg:left-[12%] lg:w-24", depth: 0.6, r: "-20deg", dur: "9s" },
  { el: <JellyBean c={k.orange} />, cls: "top-[30%] right-[2%] w-12 sm:w-16 lg:right-[18%]", depth: 2, r: "30deg", dur: "5.5s" },
  { el: <GummyBear c={k.pink} />, cls: "bottom-[30%] left-[16%] hidden w-14 lg:block", depth: 1.8, r: "16deg", dur: "7.5s" },
  { el: <Sparkle c={k.teal} />, cls: "top-[20%] left-[26%] w-6 sm:w-8", depth: 2.4, r: "0deg", dur: "4s" },
  { el: <Sparkle c={k.pink} />, cls: "bottom-[38%] right-[22%] w-5 sm:w-7", depth: 2.2, r: "0deg", dur: "5s" },
  { el: <Sparkle c={k.orange} />, cls: "top-[62%] left-[8%] w-5", depth: 2, r: "0deg", dur: "4.5s" },
];

type Piece = { id: number; x: number; y: number; dx: number; dy: number; rot: number; size: number; shape: number; colour: string };

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const nextId = useRef(0);

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    ref.current.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  }

  // Tap anywhere (except links/buttons) for a little candy burst.
  function onClick(e: MouseEvent<HTMLElement>) {
    if (!ref.current || (e.target as HTMLElement).closest("a,button")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const burst: Piece[] = Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 90 + Math.random() * 90;
      return {
        id: nextId.current++,
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 40,
        rot: (Math.random() - 0.5) * 540,
        size: 26 + Math.random() * 22,
        shape: Math.floor(Math.random() * candyShapes.length),
        colour: candyPalette[Math.floor(Math.random() * candyPalette.length)],
      };
    });
    setPieces((p) => [...p.slice(-36), ...burst]);
    const ids = new Set(burst.map((b) => b.id));
    setTimeout(() => setPieces((p) => p.filter((b) => !ids.has(b.id))), 1000);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onClick={onClick}
      className="relative isolate overflow-hidden [--mx:0] [--my:0]"
    >
      {/* Rotating sunburst */}
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-[180vmax] -translate-x-1/2 -translate-y-1/2">
        <div className="sunburst h-full w-full animate-spin-slow [--ray-a:var(--color-orange-soft)]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-cream" />

      {/* Floating candies */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {floaters.map((f, i) => (
          <div
            key={i}
            className={`absolute transition-transform duration-500 ease-out ${f.cls}`}
            style={{ transform: `translate(calc(var(--mx) * ${f.depth * -18}px), calc(var(--my) * ${f.depth * -18}px))` }}
          >
            <div className="animate-float drop-shadow-[0_10px_8px_rgb(43_29_23/0.15)]" style={{ "--r": f.r, animationDuration: f.dur, animationDelay: `${i * -0.7}s` } as CSSProperties}>
              {f.el}
            </div>
          </div>
        ))}
      </div>

      {/* Candy burst pieces */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
        {pieces.map((p) => {
          const Shape = candyShapes[p.shape];
          return (
            <div
              key={p.id}
              className="candy-burst-piece"
              style={{ left: p.x, top: p.y, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, "--size": `${p.size}px` } as CSSProperties}
            >
              <Shape c={p.colour} />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(calc(100svh-7rem),56rem)] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center sm:py-28">
        <h1 className="relative text-orange">
          <span className="block text-[clamp(2.4rem,9vw,5.5rem)]">Every Sweet Tooth</span>
          <span className="block text-[clamp(2.4rem,9vw,5.5rem)]">Needs a</span>
          <span className="relative mt-1 inline-block -rotate-3 text-[clamp(5rem,24vw,12rem)] leading-[0.9] text-pink text-pop">
            Stash
          </span>
        </h1>

        <p className="mt-8 text-sm font-semibold text-ink-soft/80" aria-hidden>
          psst… tap anywhere for candy
        </p>
      </div>
    </section>
  );
}

