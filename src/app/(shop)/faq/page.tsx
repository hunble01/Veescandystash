import type { Metadata } from "next";
import { ButtonLink, Container, DraftNote, PageHeader } from "@/components/ui";
import { site } from "@/config/site";
import { getFaq } from "@/lib/catalog";
import type { FaqLink } from "@/lib/types";

// Where each FAQ button goes. Email/phone have no href until the real
// details are in site config, and show as a placeholder spot instead.
function faqLink(link: FaqLink): { href: string | null; label: string } {
  switch (link) {
    case "shop": return { href: "/shop", label: "Shop" };
    case "build": return { href: "/build-your-stash", label: "Build Your Stash" };
    case "occasions": return { href: "/occasions", label: "Occasions" };
    case "custom": return { href: "/custom-orders", label: "Custom Orders" };
    case "contact": return { href: "/contact", label: "Contact us" };
    case "policies": return { href: "/policies", label: "Our policies" };
    case "email": return site.contact.email ? { href: `mailto:${site.contact.email}`, label: "Email us" } : { href: null, label: "Email" };
    case "phone": return site.contact.phone ? { href: `tel:+1${site.contact.phone.replace(/\D/g, "")}`, label: "Call us" } : { href: null, label: "Phone number" };
  }
}

export const metadata: Metadata = {
  title: "FAQ",
  description: "Ordering, pickup and delivery, custom orders, ingredients and policies.",
};

export default async function FaqPage() {
  const faq = await getFaq();
  const topics = [...new Set(faq.map((f) => f.topic))];

  return (
    <>
      <PageHeader eyebrow="FAQ" title="Good questions." intro="Everything you need to know before you order." />
      <Container className="max-w-3xl py-12">
        <div className="mb-10">
          <DraftNote>Answers and policies will be added once Vee confirms them. Nothing here is a final policy yet.</DraftNote>
        </div>
        {topics.map((topic) => (
          <section key={topic} className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold">{topic}</h2>
            <div className="space-y-3">
              {faq.filter((f) => f.topic === topic).map((f) => (
                <details key={f.question} className="group rounded-2xl bg-white border-[3px] border-ink shadow-[var(--shadow-pop)]">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden className="text-2xl leading-none text-orange transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-ink-soft">{f.answer ?? "Answer coming soon."}</p>
                  {f.links?.length ? (
                    <div className="flex flex-wrap gap-3 px-5 pb-5">
                      {f.links.map(faqLink).filter((l) => l !== null).map((l) =>
                        l.href ? (
                          <ButtonLink key={l.label} href={l.href} variant="secondary" className="min-h-11 px-5 text-sm">
                            {l.label}
                          </ButtonLink>
                        ) : (
                          <span key={l.label} className="inline-flex min-h-11 items-center rounded-full border-[3px] border-dashed border-ink/40 px-5 text-sm font-extrabold text-ink-soft">
                            {l.label}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="rounded-[var(--radius-card)] bg-orange-soft p-6 text-center">
          <h2 className="text-2xl font-semibold">Still wondering?</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">Ask us</ButtonLink>
            <ButtonLink href="/policies" variant="secondary">Read our policies</ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
