import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/cards";
import {
  EmptyState,
  Icon,
  OrderRow,
  Panel,
  RequestRow,
  StatTile,
  StatusBadge,
  Tracker,
  isOrderOpen,
  isRequestOpen,
  money,
  orderBadgeColor,
  orderStatusLabel,
  orderSteps,
  panel,
  shortDate,
} from "@/components/account/parts";
import { getAddresses, getCustomer, getFavouriteIds, getOrders, getRequests } from "@/lib/account";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

const greeting = () => {
  const h = Number(new Date().toLocaleString("en-CA", { hour: "numeric", hourCycle: "h23", timeZone: "America/Toronto" }));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const quickLinks = [
  { href: "/build-your-stash", title: "Build your stash", text: "Pick your bag and your candies.", color: "bg-orange-soft", icon: "bag" },
  { href: "/occasions", title: "Occasion bags", text: "Party favours for every celebration.", color: "bg-pink-soft", icon: "star" },
  { href: "/custom-orders", title: "Custom order", text: "Tell Vee about your event.", color: "bg-teal-soft", icon: "sparkle" },
] as const;

async function AccountOverviewContent() {
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const [orders, requests, favIds, addresses, products] = await Promise.all([
    getOrders(customer),
    getRequests(customer),
    getFavouriteIds(customer.id),
    getAddresses(customer.id),
    getProducts(),
  ]);
  const latest = orders.find(isOrderOpen) ?? orders[0];
  const openRequests = requests.filter(isRequestOpen);
  const favourites = favIds.map((id) => products.find((p) => p.id === id)).filter((p) => p != null);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-extrabold tracking-[0.18em] text-pink-deep uppercase">My account</p>
        <h1 className="mt-2 text-[clamp(2.2rem,6vw,3.25rem)] leading-none">
          {greeting()}
          {customer.firstName ? `, ${customer.firstName}` : ""}!
        </h1>
        <p className="mt-3 font-medium text-ink-soft">Here’s everything in your stash: orders, custom requests and favourites.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile href="/account/orders" icon="bag" label="Orders" value={orders.length} color="bg-orange-soft" />
        <StatTile href="/account/requests" icon="sparkle" label="Open requests" value={openRequests.length} color="bg-pink-soft" />
        <StatTile href="/account/favourites" icon="heart" label="Favourites" value={favourites.length} color="bg-teal-soft" />
        <StatTile href="/account/addresses" icon="pin" label="Addresses" value={addresses.length} color="bg-cream-deep" />
      </div>

      {latest ? (
        <Panel
          title={isOrderOpen(latest) ? "Your latest order" : "Your last order"}
          action={
            <Link href="/account/orders" className="text-sm font-bold text-teal-deep hover:underline">
              All orders
            </Link>
          }
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-extrabold">Order {latest.orderNumber}</p>
              <p className="text-sm font-semibold text-ink-soft">
                Placed {shortDate(latest.createdAt)} · {money(latest.total)}
              </p>
            </div>
            <StatusBadge color={orderBadgeColor(latest)}>{orderStatusLabel(latest)}</StatusBadge>
          </div>
          {latest.status !== "cancelled" && <Tracker steps={orderSteps(latest)} current={latest.status} label="Order progress" />}
          <Link
            href={`/account/orders/${encodeURIComponent(latest.orderNumber)}`}
            className="mt-6 inline-flex items-center gap-1 font-bold text-teal-deep hover:underline"
          >
            View order details <Icon name="chevron" className="h-4 w-4" />
          </Link>
        </Panel>
      ) : (
        <EmptyState icon="bag" title="No orders yet" href="/build-your-stash" cta="Build your stash">
          When you order with {customer.email}, you’ll be able to follow it here, from received to ready.
        </EmptyState>
      )}

      {openRequests.length > 0 && (
        <Panel
          title="Open custom requests"
          action={
            <Link href="/account/requests" className="text-sm font-bold text-teal-deep hover:underline">
              All requests
            </Link>
          }
        >
          <div className="grid gap-3">
            {openRequests.slice(0, 3).map((r) => (
              <RequestRow key={r._id} request={r} />
            ))}
          </div>
        </Panel>
      )}

      {orders.length > 1 && (
        <Panel title="Recent orders">
          <div className="grid gap-3">
            {orders
              .filter((o) => o !== latest)
              .slice(0, 3)
              .map((o) => (
                <OrderRow key={o._id} order={o} />
              ))}
          </div>
        </Panel>
      )}

      <section>
        <h2 className="mb-4 text-2xl sm:text-3xl">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className={`${panel} group flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop-lg)]`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink ${q.color}`}>
                <Icon name={q.icon} />
              </span>
              <span>
                <span className="block font-extrabold group-hover:underline">{q.title}</span>
                <span className="text-sm text-ink-soft">{q.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {favourites.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl">Your favourites</h2>
            <Link href="/account/favourites" className="text-sm font-bold text-teal-deep hover:underline">
              See all ({favourites.length})
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favourites.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Per-customer data loads at request time, so it streams in behind a placeholder.
export default function AccountOverview() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountOverviewContent />
    </Suspense>
  );
}
