import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui";
import { EmptyState, PageTitle, Panel, RequestRow, isRequestOpen } from "@/components/account/parts";
import { getCustomer, getRequests } from "@/lib/account";

export const metadata: Metadata = { title: "My custom requests", robots: { index: false } };

async function RequestsPageContent() {
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const requests = await getRequests(customer);
  const open = requests.filter(isRequestOpen);
  const past = requests.filter((r) => !isRequestOpen(r));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle title="Custom requests" intro="Event and occasion orders you’ve asked Vee about, and where each one is up to." />
        {requests.length > 0 && (
          <ButtonLink href="/custom-orders" className="mb-6">
            New request
          </ButtonLink>
        )}
      </div>
      {requests.length === 0 ? (
        <EmptyState icon="sparkle" title="No custom requests yet" href="/custom-orders" cta="Request a custom order">
          Planning a party, shower or wedding? Tell Vee about it and your request will show up here.
        </EmptyState>
      ) : (
        <>
          {open.length > 0 && (
            <Panel title={`Open (${open.length})`}>
              <div className="grid gap-3">
                {open.map((r) => (
                  <RequestRow key={r._id} request={r} />
                ))}
              </div>
            </Panel>
          )}
          {past.length > 0 && (
            <Panel title={`Booked & closed (${past.length})`}>
              <div className="grid gap-3">
                {past.map((r) => (
                  <RequestRow key={r._id} request={r} />
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

// Per-customer data loads at request time, so it streams in behind a placeholder.
export default function RequestsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RequestsPageContent />
    </Suspense>
  );
}
