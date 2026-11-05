import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import { notFound, redirect } from "next/navigation";
import { PrintButton, ReorderButton } from "@/components/account/OrderActions";
import {
  DetailList,
  Icon,
  PageTitle,
  Panel,
  StatusBadge,
  Tracker,
  longDate,
  money,
  orderBadgeColor,
  orderStatusLabel,
  orderSteps,
} from "@/components/account/parts";
import { site } from "@/config/site";
import { getCustomer, getOrder } from "@/lib/account";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

async function OrderDetailPageContent({ params }: { params: PageProps<"/account/orders/[number]">["params"] }) {
  const { number } = await params;
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const order = await getOrder(customer, decodeURIComponent(number));
  if (!order) notFound();

  const cancelled = order.status === "cancelled";
  const fulfilment = order.fulfilment === "pickup" ? "Pickup" : order.fulfilment === "delivery" ? "Delivery" : "";
  const helpHref = site.contact.email
    ? `mailto:${site.contact.email}?subject=${encodeURIComponent(`Question about order ${order.orderNumber}`)}`
    : "/contact";

  return (
    <div className="space-y-6">
      <PageTitle title={`Order ${order.orderNumber}`} back={{ href: "/account/orders", label: "All orders" }} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge color={orderBadgeColor(order)}>{orderStatusLabel(order)}</StatusBadge>
          <span className="text-sm font-semibold text-ink-soft">Placed {longDate(order.createdAt)}</span>
        </div>
        <div className="flex flex-wrap items-start gap-3 print:hidden">
          <ReorderButton orderNumber={order.orderNumber} />
          <PrintButton />
        </div>
      </div>

      <Panel title="Order progress">
        {cancelled ? (
          <p className="rounded-2xl bg-cream-deep px-4 py-3 font-semibold">
            This order was refunded or cancelled. If you have any questions about it, Vee’s happy to help.
          </p>
        ) : (
          <>
            <Tracker steps={orderSteps(order)} current={order.status} label="Order progress" />
            <p className="mt-5 text-sm text-ink-soft">Vee updates this as your order is packed and gets ready. Check back here any time.</p>
          </>
        )}
      </Panel>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title="What you ordered">
          <ul className="divide-y-2 divide-line">
            {order.items?.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-ink-soft">
                    {item.quantity} × {money(item.unitPrice)}
                  </p>
                </div>
                <span className="font-extrabold whitespace-nowrap">{money(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t-[3px] border-ink pt-4">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-semibold">{money(order.subtotal)}</dd>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Tax</dt>
                <dd className="font-semibold">{money(order.tax)}</dd>
              </div>
            )}
            {order.total - order.subtotal - order.tax > 0.005 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="font-semibold">{money(order.total - order.subtotal - order.tax)}</dd>
              </div>
            )}
            <div className="flex justify-between text-lg">
              <dt className="font-extrabold">Total paid</dt>
              <dd className="font-extrabold">{money(order.total)}</dd>
            </div>
          </dl>
        </Panel>

        <div className="space-y-6">
          <Panel title={fulfilment || "Getting it to you"}>
            <DetailList
              single
              rows={[
                ["Method", fulfilment || "To be confirmed"],
                ["Pickup area", order.fulfilment === "pickup" ? site.fulfilment.pickupArea : ""],
                ["Delivery address", order.shippingAddress],
              ]}
            />
          </Panel>
          <Panel title="Contact">
            <DetailList
              single
              rows={[
                ["Name", order.customer?.name],
                ["Email", order.customer?.email],
                ["Phone", order.customer?.phone],
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] bg-teal-soft p-5 print:hidden">
        <Icon name="help" />
        <p className="font-semibold">
          Something not right with this order?{" "}
          <a href={helpHref} className="font-extrabold text-teal-deep underline underline-offset-4">
            Contact Vee about {order.orderNumber}
          </a>
        </p>
      </div>
    </div>
  );
}

// Per-customer data loads at request time, so it streams in behind a placeholder.
export default function OrderDetailPage({ params }: PageProps<"/account/orders/[number]">) {
  return (
    <Suspense fallback={<Loading />}>
      <OrderDetailPageContent params={params} />
    </Suspense>
  );
}
