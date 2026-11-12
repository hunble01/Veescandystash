import type { Metadata } from "next";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import { site } from "@/config/site";
import { policies } from "@/data/policies";
import { getShippingRates } from "@/lib/catalog";
import { withShippingPrices } from "@/lib/shippingRates";

export const metadata: Metadata = {
  title: "Policies & Conditions",
  description: "Refunds and cancellations, candy freshness and how we keep your information private.",
};

// "{email}" in a policy point becomes a tappable email link.
function withEmail(point: string) {
  const email = site.contact.email;
  if (!point.includes("{email}")) return point;
  const [before, after] = point.split("{email}");
  return (
    <>
      {before}
      {email ? (
        <a href={`mailto:${email}`} className="font-bold text-pink-deep underline underline-offset-4">
          {email}
        </a>
      ) : (
        "our contact page"
      )}
      {after}
    </>
  );
}

export default async function PoliciesPage() {
  // "{shipping prices}" in a point shows the Studio's shipping price list.
  const rates = await getShippingRates();
  return (
    <>
      <PageHeader eyebrow="Policies & Conditions" title="The sweet print." intro="How orders, refunds, your candy and your privacy are handled." />
      <Container className="max-w-3xl py-12">
        {policies.map((section) => (
          <section key={section.id} id={section.id} className="mb-8 scroll-mt-28 rounded-2xl bg-white border-[3px] border-ink p-6 shadow-[var(--shadow-pop)]">
            <h2 className="mb-4 text-2xl font-semibold">{section.title}</h2>
            {section.alert && (
              <p className="mb-4 rounded-xl border-[3px] border-holiday-red bg-holiday-red-soft px-4 py-3 text-lg font-extrabold text-holiday-red-deep">
                ⚠️ {section.alert}
              </p>
            )}
            {section.points.length ? (
              <ul className="list-disc space-y-3 pl-5 text-ink-soft">
                {section.points.map((point) => <li key={point}>{withEmail(withShippingPrices(point, rates))}</li>)}
              </ul>
            ) : (
              <p className="text-ink-soft">Coming soon.</p>
            )}
          </section>
        ))}
        <div className="rounded-[var(--radius-card)] bg-orange-soft p-6 text-center">
          <h2 className="text-2xl font-semibold">Questions about a policy?</h2>
          <ButtonLink href="/contact" className="mt-4">Ask us</ButtonLink>
        </div>
      </Container>
    </>
  );
}
