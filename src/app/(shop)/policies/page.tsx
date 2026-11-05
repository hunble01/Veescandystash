import type { Metadata } from "next";
import { ButtonLink, Container, DraftNote, PageHeader } from "@/components/ui";
import { policies } from "@/data/policies";

export const metadata: Metadata = {
  title: "Policies & Conditions",
  description: "Refunds and cancellations, candy freshness and how we keep your information private.",
};

export default function PoliciesPage() {
  return (
    <>
      <PageHeader eyebrow="Policies & Conditions" title="The sweet print." intro="How orders, refunds, your candy and your privacy are handled." />
      <Container className="max-w-3xl py-12">
        <div className="mb-10">
          <DraftNote>Policies are still being written by Vee. Nothing here is final until this note is removed.</DraftNote>
        </div>
        {policies.map((section) => (
          <section key={section.id} id={section.id} className="mb-8 scroll-mt-28 rounded-2xl bg-white border-[3px] border-ink p-6 shadow-[var(--shadow-pop)]">
            <h2 className="mb-4 text-2xl font-semibold">{section.title}</h2>
            {section.points.length ? (
              <ul className="list-disc space-y-3 pl-5 text-ink-soft">
                {section.points.map((point) => <li key={point}>{point}</li>)}
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
