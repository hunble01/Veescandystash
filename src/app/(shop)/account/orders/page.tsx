import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import { redirect } from "next/navigation";
import { EmptyState, OrderRow, PageTitle, Panel, isOrderOpen } from "@/components/account/parts";
import { getCustomer, getOrders } from "@/lib/account";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

async function OrdersPageContent() {
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const orders = await getOrders(customer);
  const open = orders.filter(isOrderOpen);
  const past = orders.filter((o) => !isOrderOpen(o));

  return (
    <div className="space-y-8">
      <PageTitle
        title="My orders"
        intro={`Track your orders, see what was in them, print a receipt or order the same again. Orders placed with ${customer.emails.length > 1 ? "any of your verified emails" : customer.email} show up here, even ones placed before you made an account.`}
      />
      {orders.length === 0 ? (
        <EmptyState icon="bag" title="No orders yet" href="/build-your-stash" cta="Build your stash">
          Once you place an order, it’ll appear here so you can follow it from received to ready.
        </EmptyState>
      ) : (
        <>
          {open.length > 0 && (
            <Panel title={`In progress (${open.length})`}>
              <div className="grid gap-3">
                {open.map((o) => (
                  <OrderRow key={o._id} order={o} />
                ))}
              </div>
            </Panel>
          )}
          {past.length > 0 && (
            <Panel title={`Past orders (${past.length})`}>
              <div className="grid gap-3">
                {past.map((o) => (
                  <OrderRow key={o._id} order={o} />
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
export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersPageContent />
    </Suspense>
  );
}
