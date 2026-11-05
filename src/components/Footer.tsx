import Link from "next/link";
import { footerNav, nav, site } from "@/config/site";
import { GummyBear, Sparkle, candyColours as k } from "./Candies";
import { Marquee } from "./Marquee";
import { Container } from "./ui";

export function Footer() {
  const socials = Object.entries(site.social).filter(([, url]) => url) as [string, string][];
  // [label, what's shown, link, opens in a new tab]
  const contactRows: [string, string, string, boolean][] = [
    ...(site.contact.phone ? [["Call", site.contact.phone, `tel:+1${site.contact.phone.replace(/\D/g, "")}`, false] as [string, string, string, boolean]] : []),
    ...(site.contact.email ? [["Email", site.contact.email, `mailto:${site.contact.email}`, false] as [string, string, string, boolean]] : []),
    ...socials.map(([name, url]): [string, string, string, boolean] => [name, `@${url.split("/").filter(Boolean).pop()}`, url, true]),
  ];

  return (
    <footer className="mt-auto">
      <Marquee
        className="bg-pink"
        items={["Every sweet tooth needs a stash", "Sweet", "Sour", "Party favours", "Custom orders"]}
      />
      {/* Compact footer (Vee, 2026-10-30): links in a row, one shop name, orange
          with white writing. White on bright orange is low-contrast, so the text
          carries a thin ink shadow to stay readable. */}
      <div className="relative overflow-hidden border-t-[3px] border-ink bg-orange text-white [text-shadow:1px_1px_0_var(--color-ink)]">
        <Container className="relative z-10 pt-12 pb-7">
          <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            <div className="shrink-0">
              <p className="flex items-start gap-2 font-display text-[clamp(1.9rem,8vw,3rem)] leading-tight whitespace-nowrap text-white [text-shadow:3px_3px_0_var(--color-ink)]">
                {site.name}
                <GummyBear aria-hidden c={k.pink} className="w-[0.75em] shrink-0 rotate-12 [filter:drop-shadow(2px_2px_0_var(--color-ink))]" />
              </p>
              <p className="mt-2 text-lg font-bold">{site.slogan}</p>
            </div>

            <div className="space-y-3 text-base md:text-right">
              <nav aria-label="Footer">
                <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
                  {[...nav, ...footerNav].map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="font-extrabold text-white transition hover:text-orange-soft hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {/* Contact details stacked one under the other, each with a small
                  label (Vee, 2026-10-31). */}
              <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5 pt-3 text-left md:ml-auto md:w-fit">
                {contactRows.map(([label, text, href, external]) => (
                  <div key={label} className="contents">
                    <dt className="text-xs font-extrabold tracking-[0.15em] uppercase opacity-90">{label}</dt>
                    <dd>
                      <a
                        href={href}
                        className="font-bold text-white hover:text-orange-soft hover:underline"
                        {...(external ? { target: "_blank", rel: "noopener" } : {})}
                      >
                        {text}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>

        <Container className="relative z-10 flex items-center gap-2 border-t-2 border-white/40 py-4 text-sm font-semibold">
          <Sparkle aria-hidden c={k.cream} className="w-4" />© {site.name}
        </Container>
      </div>
    </footer>
  );
}
