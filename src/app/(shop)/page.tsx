import Link from "next/link";
import type { CSSProperties } from "react";
import { GummyBear, PeachRing, SourBelt, Sparkle, WrappedCandy, candyColours as k } from "@/components/Candies";
import { Hero } from "@/components/home/Hero";
import { JoinTheFun } from "@/components/JoinTheFun";
import { Marquee } from "@/components/Marquee";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { site } from "@/config/site";
import { getFaq } from "@/lib/catalog";

const ways = [
  {
    title: "Build Your Stash",
    body: "Pick your bag size, then fill it with whatever candy catches your eye.",
    href: "/build-your-stash",
    cta: "Build your bag",
    bg: "bg-orange-soft",
    candy: <GummyBear c={k.orange} />,
  },
  {
    title: "Occasion Bags",
    body: "Party and holiday favours we’ve already planned and are ready to make for you, or made to match your colours, ribbon and logo.",
    href: "/occasions",
    cta: "Shop occasions",
    bg: "bg-pink-soft",
    candy: <WrappedCandy c={k.pink} />,
  },
  {
    title: "Custom Orders",
    body: "You take over! Tell us your event and your candy, and we’ll make it sweet.",
    href: "/custom-orders",
    cta: "Request a custom order",
    bg: "bg-teal-soft",
    candy: <PeachRing c={k.teal} c2={k.orange} />,
  },
];

export default async function Home() {
  const faq = await getFaq();

  return (
    <>
      <Hero />

      {/* Crossed ticker ribbons */}
      <div className="relative -mt-6 overflow-hidden py-10">
        <Marquee className="-rotate-3 bg-orange" items={["Sweet", "Sour", "Stashed", "Party-ready", "Gift-ready"]} />
        <Marquee className="relative z-10 -mt-2 rotate-2 bg-teal" reverse star={k.ink} items={["Birthdays", "Baby showers", "Graduations", "Gender reveals", "Holidays"]} />
      </div>

      {/* Ways to order */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Three sweet options" title="How it works" align="center" />
          <ul className="grid gap-6 sm:grid-cols-3">
            {ways.map((w, i) => (
              <li key={w.title} data-reveal style={{ "--delay": `${i * 120}ms` } as CSSProperties}>
                <Link
                  href={w.href}
                  className="group flex h-full flex-col items-center rounded-3xl border-[3px] border-ink bg-white px-6 py-8 text-center shadow-[var(--shadow-pop)] transition hover:-translate-y-1"
                >
                  <div className={`flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-ink ${w.bg}`}>
                    <div className="w-14 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{w.candy}</div>
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-normal">{w.title}</h3>
                  <p className="mt-2 max-w-xs flex-1 text-lg font-medium text-ink-soft">{w.body}</p>
                  <span className="mt-5 font-extrabold text-orange-deep">
                    {w.cta} <span aria-hidden className="inline-block transition group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Follow along on social (same band as the About page) */}
      <JoinTheFun className="pb-20 sm:pb-28" />

      {/* Custom order golden ticket */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <div data-reveal className="relative mx-auto max-w-5xl rotate-[-1.5deg] drop-shadow-[6px_8px_0_var(--color-ink)]">
            <div className="ticket relative isolate overflow-hidden bg-teal text-ink sm:grid sm:grid-cols-[1fr_auto]">
              <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/3 -z-10 aspect-square w-[60rem] -translate-x-1/2 -translate-y-1/2">
                <div className="sunburst h-full w-full animate-spin-slow [--ray-a:#ffffff2e]" />
              </div>
              <div className="px-8 py-12 sm:px-14 sm:py-16">
                <p className="mb-3 text-sm font-extrabold tracking-[0.18em] text-ink uppercase">✦ Custom orders</p>
                <h2 className="text-[clamp(2.4rem,8vw,4.25rem)] text-cream [text-shadow:3px_4px_0_var(--color-ink)]">Planning something sweet?</h2>
                <p className="mt-4 max-w-lg text-lg font-semibold">
                  Tell us about your event: the date, how many guests, your colours and any wording. We’ll get back to you with ideas and a quote.
                </p>
                <ButtonLink href="/custom-orders" className="mt-8">Request a Custom Order</ButtonLink>
              </div>
              {/* Ticket stub */}
              <div className="relative flex items-center justify-center border-t-[3px] border-dashed border-ink/50 px-8 py-6 sm:border-t-0 sm:border-l-[3px] sm:py-0">
                <p className="font-display text-2xl text-cream [text-shadow:2px_3px_0_var(--color-ink)] sm:[writing-mode:vertical-rl] sm:text-3xl">
                  Admit one sweet event
                </p>
              </div>
            </div>
            <SourBelt c={k.orange} aria-hidden className="absolute -top-8 -right-4 w-32 rotate-12 sm:-right-10 sm:w-44" />
            <Sparkle c={k.pink} aria-hidden className="absolute -bottom-6 left-8 w-12" />
          </div>
        </Container>
      </section>

      {/* Closing */}
      <section className="pb-20 sm:pb-28">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div data-reveal>
            <Eyebrow>Made by Vee</Eyebrow>
            <h2 className="text-[clamp(2.2rem,7vw,3.5rem)]">A small shop with a big sweet tooth.</h2>
            <p className="mt-4 text-lg font-medium text-ink-soft">
              {site.name} is a small {site.region} candy business making cute, giftable candy bags and party favours.
            </p>
            <ButtonLink href="/about" variant="ghost" className="mt-4 px-0 text-lg">Meet Vee →</ButtonLink>
          </div>
          <div data-reveal style={{ "--delay": "120ms" } as CSSProperties}>
            <h2 className="mb-5 text-3xl">Questions?</h2>
            <ul className="space-y-3">
              {faq.slice(0, 4).map((f) => (
                <li key={f.question}>
                  <Link
                    href="/faq"
                    className="group flex items-center justify-between gap-4 rounded-2xl border-[3px] border-ink bg-white px-5 py-4 font-bold shadow-[var(--shadow-pop)] transition hover:-translate-y-0.5 hover:bg-orange-soft"
                  >
                    {f.question}
                    <span aria-hidden className="text-xl transition group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
