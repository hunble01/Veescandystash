import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { GummyBear, Lollipop, SmileyCandy, Sparkle, candyColours as k } from "./Candies";
import { Marquee } from "./Marquee";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./SocialIcons";
import { ButtonLink, Container } from "./ui";

// Footer, redesigned 2026-11-04 (Vee: "way more world class"). Laid out like
// the big shop sites: a call-to-action card, brand block with logo and
// socials, grouped link columns, contact details and a slim legal bar.
// Still orange with white writing (Vee, 2026-10-30); white on orange is
// low-contrast, so text carries a thin ink shadow.

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/build-your-stash", label: "Build Your Stash" },
      { href: "/occasions", label: "Occasions" },
      { href: "/custom-orders", label: "Custom Orders" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/policies", label: "Policies" },
      { href: "/contact", label: "Contact" },
      { href: "/account", label: "My account" },
    ],
  },
] as const;

const socialIcons = { instagram: InstagramIcon, tiktok: TikTokIcon, facebook: FacebookIcon } as const;
const socialNames = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" } as const;

const linkClass =
  "font-bold text-white decoration-2 underline-offset-4 transition hover:text-cream hover:underline hover:decoration-wavy";

export function Footer() {
  const socials = (Object.keys(socialIcons) as (keyof typeof socialIcons)[])
    .map((key) => ({ key, url: site.social[key] }))
    .filter((s): s is { key: keyof typeof socialIcons; url: string } => Boolean(s.url));
  const phoneHref = site.contact.phone ? `tel:+1${site.contact.phone.replace(/\D/g, "")}` : null;

  return (
    <footer className="mt-auto">
      <Marquee className="bg-pink" items={["Every sweet tooth needs a stash", "Sweet", "Sour", "Party favours", "Custom orders"]} />

      <div className="relative overflow-hidden border-t-[3px] border-ink bg-orange text-white [text-shadow:1px_1px_0_var(--color-ink)]">
        {/* Candy peeking in from the corners. */}
        <GummyBear aria-hidden c={k.pink} className="pointer-events-none absolute -bottom-6 -left-5 hidden w-28 -rotate-12 opacity-90 sm:block" />
        <Lollipop aria-hidden c={k.teal} className="pointer-events-none absolute right-3 bottom-24 hidden w-16 rotate-12 lg:block" />

        <Container className="relative z-10 pt-12 sm:pt-14">
          {/* Call to action */}
          <div className="relative flex flex-col gap-6 rounded-[2rem] border-[3px] border-ink bg-cream p-6 text-ink shadow-[var(--shadow-pop-lg)] [text-shadow:none] sm:p-8 md:flex-row md:items-center md:justify-between">
            <SmileyCandy aria-hidden c={k.pink} className="absolute -top-7 right-6 w-16 rotate-12 md:-top-8 md:right-10" />
            <div className="max-w-xl">
              <h2 className="font-display text-4xl text-orange text-pop sm:text-5xl">Planning something sweet?</h2>
              <p className="mt-3 text-lg text-ink-soft">
                Birthdays, baby showers, graduations and holidays. Tell us your idea and we’ll make it sweet.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <ButtonLink href="/custom-orders">Request a custom order</ButtonLink>
              <ButtonLink href="/build-your-stash" variant="secondary">
                Build your stash
              </ButtonLink>
            </div>
          </div>

          {/* Brand + links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-14 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-8">
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" aria-label={`${site.name} home`} className="flex items-center gap-4">
                {site.logo && (
                  <Image
                    src={site.logo.src}
                    width={site.logo.width}
                    height={site.logo.height}
                    alt=""
                    className="h-20 w-20 shrink-0 drop-shadow-[3px_4px_0_var(--color-ink)]"
                  />
                )}
                <span className="font-display text-4xl leading-none text-white [text-shadow:3px_3px_0_var(--color-ink)]">
                  {site.name}
                </span>
              </Link>
              <p className="mt-5 text-xl font-extrabold">{site.slogan}</p>
              <p className="mt-2 max-w-sm font-semibold text-white/95">{site.description}</p>

              {socials.length > 0 && (
                <ul className="mt-6 flex gap-3" aria-label="Follow us">
                  {socials.map(({ key, url }) => {
                    const Icon = socialIcons[key];
                    return (
                      <li key={key}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener"
                          aria-label={`${socialNames[key]} (opens in a new tab)`}
                          className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-cream text-ink shadow-[var(--shadow-pop)] transition hover:-translate-y-0.5 hover:bg-pink-soft active:translate-y-0.5 active:shadow-none"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="font-display text-3xl text-cream [text-shadow:2px_2px_0_var(--color-ink)]">{col.title}</h2>
                <ul className="mt-4 space-y-3 text-lg">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="col-span-2 lg:col-span-1">
              <h2 className="font-display text-3xl text-cream [text-shadow:2px_2px_0_var(--color-ink)]">Say hi</h2>
              <ul className="mt-4 space-y-3 text-lg">
                {site.contact.phone && phoneHref && (
                  <li>
                    <span className="block text-xs font-extrabold tracking-[0.15em] uppercase opacity-90">Call or text</span>
                    <a href={phoneHref} className={linkClass}>
                      {site.contact.phone}
                    </a>
                  </li>
                )}
                {site.contact.email && (
                  <li>
                    <span className="block text-xs font-extrabold tracking-[0.15em] uppercase opacity-90">Email</span>
                    <a href={`mailto:${site.contact.email}`} className={`${linkClass} break-all`}>
                      {site.contact.email}
                    </a>
                  </li>
                )}
                {site.fulfilment.pickupArea && (
                  <li>
                    <span className="block text-xs font-extrabold tracking-[0.15em] uppercase opacity-90">Pickup</span>
                    <span className="font-bold">{site.fulfilment.pickupArea}</span>
                  </li>
                )}
                {site.fulfilment.footerDelivery && site.fulfilment.methods.includes("delivery") && (
                  <li>
                    <span className="block text-xs font-extrabold tracking-[0.15em] uppercase opacity-90">Delivery</span>
                    <span className="font-bold">{site.fulfilment.footerDelivery}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Container>

        {/* Legal bar */}
        <div className="relative z-10 border-t-2 border-white/40">
          <Container className="flex flex-col gap-3 py-5 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2">
              <Sparkle aria-hidden c={k.cream} className="w-4 shrink-0" />© {site.name} · Made with love in {site.region}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <Link href="/policies" className={linkClass}>
                  Policies
                </Link>
              </li>
              <li>
                <Link href="/faq" className={linkClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Back to top ↑
                </a>
              </li>
            </ul>
          </Container>
        </div>
      </div>
    </footer>
  );
}
