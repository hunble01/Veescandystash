import Link from "next/link";
import type { ReactNode } from "react";
import type { AccountOrder, AccountRequest } from "@/lib/account";
import { ButtonLink } from "../ui";

// Building blocks shared by every /account page. Server-safe (no hooks).

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
export const money = (n: number | null | undefined) => cad.format(n ?? 0);
export const shortDate = (iso?: string) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-CA", { dateStyle: "medium" }) : "";
export const longDate = (iso?: string) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-CA", { dateStyle: "long" }) : "";

// ---------- Statuses (set by Vee in the Studio) ----------

export const isOrderOpen = (o: AccountOrder) => !["done", "cancelled"].includes(o.status);
export const isRequestOpen = (r: AccountRequest) => !["booked", "closed"].includes(r.status);

export function orderSteps(o: AccountOrder) {
  return [
    { key: "new", label: "Received" },
    { key: "packed", label: "Packed" },
    { key: "ready", label: o.fulfilment === "pickup" ? "Ready for pickup" : o.fulfilment === "delivery" ? "Out for delivery" : "Ready" },
    { key: "done", label: o.fulfilment === "pickup" ? "Picked up" : o.fulfilment === "delivery" ? "Delivered" : "Complete" },
  ];
}
export const requestSteps = [
  { key: "new", label: "Received" },
  { key: "quoted", label: "Quote & details" },
  { key: "booked", label: "Booked" },
];

export function orderStatusLabel(o: AccountOrder) {
  if (o.status === "cancelled") return "Refunded / cancelled";
  return orderSteps(o).find((s) => s.key === o.status)?.label ?? "Received";
}
export function requestStatusLabel(r: AccountRequest) {
  if (r.status === "closed") return "Not going ahead";
  return requestSteps.find((s) => s.key === r.status)?.label ?? "Received";
}

const tone = {
  orange: "bg-orange-soft text-orange-deep",
  pink: "bg-pink-soft text-pink-deep",
  teal: "bg-teal-soft text-teal-deep",
  grey: "bg-cream-deep text-ink-soft",
};

export function StatusBadge({ children, color = "orange" }: { children: ReactNode; color?: keyof typeof tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink/80 px-3 py-0.5 text-xs font-extrabold whitespace-nowrap ${tone[color]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export const orderBadgeColor = (o: AccountOrder): keyof typeof tone =>
  o.status === "cancelled" ? "grey" : o.status === "done" ? "teal" : "orange";
export const requestBadgeColor = (r: AccountRequest): keyof typeof tone =>
  r.status === "closed" ? "grey" : r.status === "booked" ? "teal" : "pink";

// Horizontal step tracker on wide screens, vertical on phones.
export function Tracker({ steps, current, label }: { steps: { key: string; label: string }[]; current: string; label: string }) {
  const at = Math.max(0, steps.findIndex((s) => s.key === current));
  return (
    <ol aria-label={label} className="grid gap-3 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))] sm:gap-0" style={{ ["--n" as string]: steps.length }}>
      {steps.map((s, i) => {
        const done = i <= at;
        return (
          <li key={s.key} className="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center" aria-current={i === at ? "step" : undefined}>
            {i > 0 && (
              <span aria-hidden className={`absolute top-[0.95rem] right-1/2 hidden h-1 w-full -translate-y-1/2 sm:block ${i <= at ? "bg-ink" : "bg-line"}`} />
            )}
            <span
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-[3px] text-sm font-extrabold ${
                done ? "border-ink bg-orange text-ink" : "border-line bg-white text-ink-soft"
              } ${i === at ? "ring-4 ring-orange-soft" : ""}`}
            >
              {i < at ? <Icon name="check" className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-sm font-bold ${done ? "text-ink" : "text-ink-soft"}`}>
              {s.label}
              {i === at && <span className="sr-only"> (current)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Layout pieces ----------

export const panel = "rounded-[var(--radius-card)] border-[3px] border-ink bg-white shadow-[var(--shadow-pop)]";

export function Panel({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${panel} p-5 sm:p-7 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-2xl sm:text-3xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, intro, back }: { title: string; intro?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-teal-deep hover:underline">
          <Icon name="arrow-left" className="h-4 w-4" /> {back.label}
        </Link>
      )}
      <h1 className="text-[clamp(2.2rem,6vw,3.25rem)] leading-none">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl font-medium text-ink-soft">{intro}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, children, href, cta }: { icon: IconName; title: string; children: ReactNode; href: string; cta: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border-[3px] border-dashed border-ink/25 bg-white/70 px-6 py-10 text-center">
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-[3px] border-ink bg-pink-soft">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md font-medium text-ink-soft">{children}</p>
      <ButtonLink href={href} variant="secondary" className="mt-5">
        {cta}
      </ButtonLink>
    </div>
  );
}

export function StatTile({ href, icon, label, value, color }: { href: string; icon: IconName; label: string; value: number; color: string }) {
  return (
    <Link href={href} className={`${panel} group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop-lg)]`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-[3px] border-ink ${color}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-3xl leading-none">{value}</span>
        <span className="text-sm font-bold text-ink-soft group-hover:text-ink">{label}</span>
      </span>
    </Link>
  );
}

// ---------- Summary cards ----------

export function OrderRow({ order }: { order: AccountOrder }) {
  const count = order.items?.reduce((n, i) => n + (i.quantity ?? 0), 0) ?? 0;
  return (
    <Link
      href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
      className="group grid gap-3 rounded-2xl border-2 border-line bg-white p-4 transition hover:border-ink hover:shadow-[var(--shadow-pop)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold">Order {order.orderNumber}</span>
          <StatusBadge color={orderBadgeColor(order)}>{orderStatusLabel(order)}</StatusBadge>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          {shortDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"}
          {order.fulfilment && <> · {order.fulfilment === "pickup" ? "Pickup" : "Delivery"}</>}
        </p>
        <p className="mt-1 truncate text-sm text-ink-soft">{order.items?.map((i) => i.name).join(", ")}</p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-lg font-extrabold">{money(order.total)}</span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-deep group-hover:underline">
          View <Icon name="chevron" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function RequestRow({ request }: { request: AccountRequest }) {
  return (
    <Link
      href={`/account/requests/${encodeURIComponent(request._id)}`}
      className="group grid gap-3 rounded-2xl border-2 border-line bg-white p-4 transition hover:border-ink hover:shadow-[var(--shadow-pop)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold">{request.occasion || "Custom order"}</span>
          <StatusBadge color={requestBadgeColor(request)}>{requestStatusLabel(request)}</StatusBadge>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          {request.quantity ? `${request.quantity} bags · ` : ""}
          {request.eventDate ? `Event ${shortDate(request.eventDate)}` : "No event date"} · Sent {shortDate(request.createdAt)}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-deep group-hover:underline">
        View details <Icon name="chevron" className="h-4 w-4" />
      </span>
    </Link>
  );
}

// Label/value list used on detail pages.
export function DetailList({ rows, single = false }: { rows: [string, ReactNode][]; single?: boolean }) {
  const shown = rows.filter(([, v]) => v !== undefined && v !== null && v !== "");
  return (
    <dl className={`grid gap-x-6 gap-y-4 ${single ? "" : "sm:grid-cols-2"}`}>
      {shown.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs font-extrabold tracking-[0.12em] text-ink-soft uppercase">{k}</dt>
          <dd className="mt-1 font-semibold break-words whitespace-pre-line">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Icons (simple strokes, inherit text colour) ----------

const paths = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  bag: "M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  pin: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01",
  logout: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l4-4-4-4M14 12H4",
  check: "M5 12.5 10 17l9-10",
  chevron: "M9 6l6 6-6 6",
  "arrow-left": "M15 6l-6 6 6 6",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  print: "M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z",
  repeat: "M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z",
  lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
};

export type IconName = keyof typeof paths;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}
