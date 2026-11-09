"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useTransition } from "react";
import { placeOrder, type PlacedOrder } from "./actions";
import { GummyBear, Sparkle, candyColours as k } from "@/components/Candies";
import { Field, Input, Textarea, describedBy } from "@/components/form";
import { Button, ButtonLink } from "@/components/ui";
import { cart, saveCode, useCart, useSavedCode } from "@/lib/cart";
import { describePicks, formatPrice } from "@/lib/format";

type Zone = { id: string; label: string; feeCents: number };

const panel = "rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8";

function Choice({ name, value, checked, onChange, title, detail }: { name: string; value: string; checked: boolean; onChange: (v: string) => void; title: string; detail?: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border-[3px] p-4 transition ${checked ? "border-ink bg-orange-soft shadow-[var(--shadow-pop)]" : "border-ink/30 bg-white hover:border-ink/60"}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="mt-1 h-5 w-5 accent-[var(--color-orange)]" />
      <span>
        <span className="block font-extrabold">{title}</span>
        {detail && <span className="block text-sm font-medium text-ink-soft">{detail}</span>}
      </span>
    </label>
  );
}

export function CheckoutForm({
  pickup,
  zones,
  freeDeliveryOverCents,
  cash,
  contactEmail,
}: {
  pickup: string | null;
  zones: Zone[];
  freeDeliveryOverCents: number | null;
  cash: boolean;
  contactEmail: string | null;
}) {
  const { lines, subtotalCents } = useCart();
  const { user } = useUser();
  const [fulfilment, setFulfilment] = useState(pickup ? "pickup" : zones[0]?.id ?? "");
  const [chosenPayment, setPayment] = useState("etransfer");
  const saved = useSavedCode();
  const [removed, setRemoved] = useState(false);
  const code = removed ? "" : saved;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [sending, startSending] = useTransition();

  const zone = zones.find((z) => z.id === fulfilment);
  const cashOk = cash && fulfilment === "pickup";
  const payment = cashOk ? chosenPayment : "etransfer";

  // Estimate only: the server works out the real total (and checks the code).
  const deliveryCents = zone ? (freeDeliveryOverCents != null && subtotalCents >= freeDeliveryOverCents ? 0 : zone.feeCents) : 0;

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const d = new FormData(form);
    const get = (n: string) => String(d.get(n) ?? "");
    setProblem("");
    startSending(async () => {
      const r = await placeOrder({
        lines: lines.map((l) => ({ productId: l.productId, sizeId: l.sizeId, candyIds: l.candies?.map((c) => c.id), qty: l.qty })),
        code: code.trim() || undefined,
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        fulfilment,
        street: get("street"),
        city: get("city"),
        postalCode: get("postalCode"),
        payment,
        notes: get("notes"),
        website: get("website"),
      });
      if (r.status === "placed") {
        setPlaced(r.order);
        cart.clear();
        saveCode("");
        window.scrollTo({ top: 0 });
      } else if (r.status === "invalid") {
        setErrors(r.errors);
        const first = Object.keys(r.errors)[0];
        form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      } else {
        setErrors({});
        setProblem(r.message);
      }
    });
  }

  if (placed) return <Placed order={placed} pickup={pickup} contactEmail={contactEmail} />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <GummyBear c={k.pink} className="mx-auto w-24 -rotate-12" />
        <h2 className="mt-6 text-4xl">Your stash is empty.</h2>
        <ButtonLink href="/build-your-stash" className="mt-8">Build your stash</ButtonLink>
      </div>
    );
  }

  const props = (n: string) => ({
    id: n,
    name: n,
    "aria-invalid": errors[n] ? true : undefined,
    "aria-describedby": describedBy(n, { error: errors[n] }),
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      // Clear a field's error as soon as it's changed.
      onChange={(e) => {
        const n = (e.target as unknown as HTMLInputElement).name;
        if (errors[n]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== n)));
      }}
      className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className={`space-y-5 ${panel}`}>
          <h2 className="text-3xl">1. Your details</h2>
          <Field id="name" label="Name" required error={errors.name}>
            <Input {...props("name")} autoComplete="name" defaultValue={user?.fullName ?? ""} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="email" label="Email" required error={errors.email}>
              <Input type="email" {...props("email")} autoComplete="email" defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""} />
            </Field>
            <Field id="phone" label="Phone" required error={errors.phone}>
              <Input type="tel" {...props("phone")} autoComplete="tel" />
            </Field>
          </div>
        </section>

        <section className={`space-y-4 ${panel}`}>
          <h2 className="text-3xl">2. Pickup or delivery</h2>
          <div role="radiogroup" aria-label="Pickup or delivery" className="grid gap-3">
            {pickup && <Choice name="fulfilment" value="pickup" checked={fulfilment === "pickup"} onChange={setFulfilment} title={`Pickup in ${pickup} · Free`} detail="Vee will email you the address and a time when it’s ready." />}
            {zones.map((z) => (
              <Choice
                key={z.id}
                name="fulfilment"
                value={z.id}
                checked={fulfilment === z.id}
                onChange={setFulfilment}
                title={`Delivery · ${formatPrice(z.feeCents)}`}
                detail={z.label}
              />
            ))}
          </div>
          {zones.length > 0 && freeDeliveryOverCents != null && (
            <p className="text-sm font-bold text-teal-deep">🚚 Free delivery on orders of {formatPrice(freeDeliveryOverCents)} or more.</p>
          )}
          {errors.fulfilment && <p className="text-sm font-semibold text-pink-deep">{errors.fulfilment}</p>}
          {zone && (
            <div className="space-y-5 pt-2">
              <Field id="street" label="Street address" required error={errors.street}>
                <Input {...props("street")} autoComplete="street-address" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="city" label="Town / city" required error={errors.city}>
                  <Input {...props("city")} autoComplete="address-level2" />
                </Field>
                <Field id="postalCode" label="Postal code" required error={errors.postalCode}>
                  <Input {...props("postalCode")} autoComplete="postal-code" autoCapitalize="characters" />
                </Field>
              </div>
            </div>
          )}
        </section>

        <section className={`space-y-4 ${panel}`}>
          <h2 className="text-3xl">3. How you’ll pay</h2>
          <div role="radiogroup" aria-label="How you’ll pay" className="grid gap-3">
            <Choice name="payment" value="etransfer" checked={payment === "etransfer"} onChange={setPayment} title="Interac e-Transfer" detail="You’ll get the details after you place your order. We start packing once it arrives." />
            {cashOk && <Choice name="payment" value="cash" checked={payment === "cash"} onChange={setPayment} title="Cash at pickup" detail="Pay when you pick up your order." />}
          </div>
          {cash && !cashOk && <p className="text-sm font-medium text-ink-soft">Cash is for pickup orders only.</p>}
          {errors.payment && <p className="text-sm font-semibold text-pink-deep">{errors.payment}</p>}
          <Field id="notes" label="Anything Vee should know?" error={errors.notes}>
            <Textarea {...props("notes")} rows={3} placeholder="e.g. a good time for pickup, or delivery instructions" />
          </Field>
        </section>

        <div aria-hidden className="absolute -left-[9999px]">
          <label>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <aside className="sticky top-32 rounded-[var(--radius-card)] border-[3px] border-ink bg-orange-soft p-6 shadow-[var(--shadow-pop-lg)]">
        <h2 className="text-3xl">Your order</h2>
        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block font-bold">{l.qty} × {l.productName}</span>
                <span className="block text-sm text-ink-soft">{l.sizeLabel}{l.candies ? `: ${describePicks(l.candies.map((c) => c.name))}` : ""}</span>
              </span>
              <span className="font-bold whitespace-nowrap">{formatPrice(l.unitPriceCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t-[3px] border-ink pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{formatPrice(subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt>{zone ? "Delivery" : "Pickup"}</dt><dd className="font-bold">{deliveryCents ? formatPrice(deliveryCents) : "Free"}</dd></div>
          {code && <div className="flex justify-between text-sm"><dt>Code {code.toUpperCase()}</dt><dd className="font-bold">applied when you order</dd></div>}
          <div className="flex justify-between text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(subtotalCents + deliveryCents)}{code ? "*" : ""}</dd></div>
        </dl>
        {code && <p className="mt-1 text-xs font-medium text-ink-soft">*Before your discount. Your final total shows on the next screen.</p>}
        {errors.code && (
          <p role="alert" className="mt-3 rounded-xl bg-pink-soft px-4 py-3 text-sm font-semibold text-pink-deep">
            {errors.code} <button type="button" className="underline" onClick={() => { setRemoved(true); setErrors({}); saveCode(""); }}>Remove code</button>
          </p>
        )}
        {problem && (
          <p role="alert" className="mt-3 rounded-xl bg-pink-soft px-4 py-3 text-sm font-semibold text-pink-deep">
            {problem}
          </p>
        )}
        <Button type="submit" disabled={sending} className="mt-6 w-full">
          {sending ? "Placing your order…" : "Place order"}
        </Button>
        <p className="mt-3 text-center text-sm font-medium text-ink-soft">
          Nothing is charged now. <Link href="/policies" className="underline">Policies</Link>
        </p>
      </aside>
    </form>
  );
}

function Placed({ order, pickup, contactEmail }: { order: PlacedOrder; pickup: string | null; contactEmail: string | null }) {
  const total = formatPrice(order.totalCents);
  return (
    <div role="status" className="mx-auto max-w-2xl space-y-6">
      <div className={`${panel} text-center`}>
        <Sparkle c={k.teal} aria-hidden className="mx-auto w-10" />
        <h2 className="mt-4 text-[clamp(2.4rem,8vw,3.5rem)]">
          Thank you! <span className="text-orange text-pop">Order placed.</span>
        </h2>
        <p className="mt-4 text-lg font-medium">Your order number is</p>
        <p className="mt-2 inline-block rounded-2xl border-[3px] border-ink bg-orange-soft px-5 py-2 font-mono text-3xl font-extrabold tracking-wider">{order.orderNumber}</p>
      </div>

      <div className={`${panel} space-y-3 bg-teal-soft`}>
        <h3 className="text-2xl">How to pay</h3>
        {order.payment === "etransfer" ? (
          <ol className="list-decimal space-y-2 pl-6 text-lg font-medium">
            <li>Open your banking app and send an <b>Interac e-Transfer</b>.</li>
            <li>Amount: <b>{total}</b></li>
            <li>Send to: <b className="break-all">{order.eTransferEmail}</b></li>
            <li>In the message, write your order number: <b>{order.orderNumber}</b></li>
          </ol>
        ) : (
          <p className="text-lg font-medium">Bring <b>{total}</b> in cash when you pick up your order.</p>
        )}
        <p className="font-medium text-ink-soft">
          {order.payment === "etransfer" ? "We start packing as soon as your payment arrives. " : ""}
          {order.fulfilment === "pickup"
            ? `Pickup is in ${pickup ?? "Vaughan"}: Vee will email you the address and a time when your order is ready.`
            : "Vee will email you when your order is on its way."}
        </p>
      </div>

      <div className={`${panel} space-y-2`}>
        <dl className="space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{formatPrice(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 && <div className="flex justify-between"><dt>Discount</dt><dd className="font-bold">−{formatPrice(order.discountCents)}</dd></div>}
          <div className="flex justify-between"><dt>{order.fulfilment === "delivery" ? "Delivery" : "Pickup"}</dt><dd className="font-bold">{order.deliveryCents ? formatPrice(order.deliveryCents) : "Free"}</dd></div>
          <div className="flex justify-between text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{total}</dd></div>
        </dl>
        <p className="pt-2 text-sm font-medium text-ink-soft">
          {order.emailed ? "We’ve also emailed you these details. " : "Please take a screenshot of this page for your records. "}
          Questions? {contactEmail ? <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`} className="underline">Email us</a> : <Link href="/contact" className="underline">Contact us</Link>}.
        </p>
      </div>
      <div className="text-center">
        <ButtonLink href="/build-your-stash" variant="secondary">Keep browsing</ButtonLink>
      </div>
    </div>
  );
}
