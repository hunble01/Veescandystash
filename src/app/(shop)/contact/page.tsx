import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { Container, PageHeader } from "@/components/ui";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
};

const socialLabel: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };

export default function ContactPage() {
  const socials = Object.entries(site.social).filter(([, url]) => url) as [string, string][];

  return (
    <>
      <PageHeader eyebrow="Contact" title="Say hi." intro="Questions about an order, an event or a candy craving? We’d love to hear from you." />
      <Container className="grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
        <ContactForm />
        <aside className="space-y-5">
          <div className="rounded-[var(--radius-card)] bg-white p-6 border-[3px] border-ink shadow-[var(--shadow-pop)]">
            <h2 className="text-xl font-semibold">Email</h2>
            {site.contact.email ? (
              <>
                <a href={`mailto:${site.contact.email}`} className="mt-1 block text-teal-deep underline">{site.contact.email}</a>
                {site.contact.replyTime && <p className="mt-2 text-sm font-semibold text-ink-soft">{site.contact.replyTime}</p>}
              </>
            ) : (
              <p className="mt-1 text-ink-soft">Coming soon.</p>
            )}
            <h2 className="mt-5 text-xl font-semibold">Social</h2>
            {socials.length ? (
              <ul className="mt-1 space-y-1">
                {socials.map(([name, url]) => (
                  <li key={name}><a href={url} className="text-teal-deep underline" target="_blank" rel="noopener">{socialLabel[name] ?? name}</a></li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-ink-soft">Coming soon.</p>
            )}
          </div>
        </aside>
      </Container>
    </>
  );
}
