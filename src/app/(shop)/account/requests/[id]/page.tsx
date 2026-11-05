import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import { notFound, redirect } from "next/navigation";
import {
  DetailList,
  Icon,
  PageTitle,
  Panel,
  StatusBadge,
  Tracker,
  longDate,
  requestBadgeColor,
  requestStatusLabel,
  requestSteps,
} from "@/components/account/parts";
import { site } from "@/config/site";
import { getCustomer, getRequest } from "@/lib/account";

export const metadata: Metadata = { title: "Custom request", robots: { index: false } };

const whatNext: Record<string, string> = {
  new: "Vee has your request and will be in touch to talk through the details and send you a quote.",
  quoted: "Vee has been in touch about the details and price. Reply to her message to go ahead or ask questions.",
  booked: "Your order is booked. Vee will confirm pickup or delivery details closer to your date.",
  closed: "This request isn’t going ahead. If plans change, you’re always welcome to send a new one.",
};

async function RequestDetailPageContent({ params }: { params: PageProps<"/account/requests/[id]">["params"] }) {
  const { id } = await params;
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const r = await getRequest(customer, decodeURIComponent(id));
  if (!r) notFound();

  const title = r.occasion || "Custom order";
  const ask = site.contact.email
    ? `mailto:${site.contact.email}?subject=${encodeURIComponent(`My ${title} request${r.eventDate ? ` (${r.eventDate})` : ""}`)}`
    : "/contact";

  return (
    <div className="space-y-6">
      <PageTitle title={title} back={{ href: "/account/requests", label: "All requests" }} />
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge color={requestBadgeColor(r)}>{requestStatusLabel(r)}</StatusBadge>
        <span className="text-sm font-semibold text-ink-soft">Sent {longDate(r.createdAt)}</span>
      </div>

      <Panel title="Where it’s up to">
        {r.status !== "closed" && <Tracker steps={requestSteps} current={r.status} label="Request progress" />}
        <p className={`font-semibold ${r.status !== "closed" ? "mt-5 text-ink-soft" : ""}`}>{whatNext[r.status] ?? whatNext.new}</p>
      </Panel>

      <Panel title="Your event">
        <DetailList
          rows={[
            ["Occasion", r.occasion],
            ["Event date", longDate(r.eventDate)],
            ["How many bags", r.quantity ? String(r.quantity) : ""],
            ["Bag size", r.size],
            ["Colours / theme", r.theme],
            ["Candy mix", r.mix],
            ["Ingredient / allergen notes", r.allergens],
            ["Label wording", r.label],
            ["Packaging extras", r.packaging],
            ["Budget", r.budget],
            ["Pickup or delivery", r.fulfilment],
            ["Town / city", r.area],
            ["Anything else", r.notes],
            ["Inspiration photos", r.photoCount ? `${r.photoCount} sent` : ""],
          ]}
        />
      </Panel>

      <Panel title="Your contact details">
        <DetailList
          rows={[
            ["Name", r.name],
            ["Email", r.email],
            ["Phone", r.phone],
          ]}
        />
      </Panel>

      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] bg-teal-soft p-5">
        <Icon name="mail" />
        <p className="font-semibold">
          Need to change something or ask a question?{" "}
          <a href={ask} className="font-extrabold text-teal-deep underline underline-offset-4">
            Message Vee about this request
          </a>
        </p>
      </div>
    </div>
  );
}

// Per-customer data loads at request time, so it streams in behind a placeholder.
export default function RequestDetailPage({ params }: PageProps<"/account/requests/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <RequestDetailPageContent params={params} />
    </Suspense>
  );
}
