"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { myCheckoutDefaults, placeOrder, quoteShipping, type PlacedOrder } from "./actions";
import { GummyBear, Sparkle, candyColours as k } from "@/components/Candies";
import { Field, Input, Select, Textarea, describedBy } from "@/components/form";
import { POSTAL_RULES, countryOptions } from "@/data/countries";
import type { ShipQuote } from "@/lib/canadaPost";
import { Button, ButtonLink } from "@/components/ui";
import { PromoCode } from "@/components/PromoCode";
import { cart, saveCode, useCart, useSavedCode } from "@/lib/cart";
import { describeExtras, describePicks, formatPrice } from "@/lib/format";

type Quotes = { state: "idle" | "loading" | "ok" | "error"; quotes: ShipQuote[]; message: string };
const days = (d: number | null) => (d ? ` · about ${d} business day${d === 1 ? "" : "s"} in transit` : "");

// Fill empty fields from the customer's account (saved default address).
// Written straight into the inputs so nothing they've typed is replaced.
function fillEmpty(form: HTMLFormElement | null, d: Record<string, string> | null) {
  if (!d || !form) return;
  for (const [name, value] of Object.entries(d)) {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLInputElement && !input.value && value) input.value = value;
  }
}

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
  shipping,
  shippingArea,
  shippingCountries,
  expressPickupCents,
  pickupDays,
  cash,
  contactEmail,
}: {
  pickup: string | null;
  /** Carrier name when shipping is offered (Canada Post), else null. */
  shipping: string | null;
  /** e.g. "We ship to Canada and the USA." */
  shippingArea: string;
  /** Countries shipping goes to: "all", or a list of codes. */
  shippingCountries: "all" | string[];
  /** Extra charge for Express pickup; null = only regular pickup. */
  expressPickupCents: number | null;
  pickupDays: { regular: string; express: string };
  cash: boolean;
  contactEmail: string | null;
}) {
  const { lines, subtotalCents } = useCart();
  const { isSignedIn } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const defaults = useRef<Awaited<ReturnType<typeof myCheckoutDefaults>>>(null);
  // "pickup" (regular, free), "pickup_express" (Vee, 2026-11-12) or "ship";
  // when shipping, the customer then picks Standard or Express.
  const [fulfilment, setFulfilment] = useState(pickup ? "pickup" : shipping ? "ship" : "");
  const [speed, setSpeed] = useState<"standard" | "express">("standard");
  const [country, setCountry] = useState("CA");
  const [postal, setPostal] = useState("");
  const [rates, setRates] = useState<Quotes>({ state: "idle", quotes: [], message: "" });
  const [countries] = useState(() => countryOptions().filter((c) => shippingCountries === "all" || shippingCountries.includes(c.code)));
  const [chosenPayment, setPayment] = useState("etransfer");
  const saved = useSavedCode();
  const [promo, setPromo] = useState({ code: "", percent: 0 });
  const code = promo.code;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [sending, startSending] = useTransition();

  useEffect(() => {
    if (!isSignedIn) return;
    let live = true;
    myCheckoutDefaults()
      .then((d) => {
        if (!live) return;
        defaults.current = d;
        fillEmpty(formRef.current, d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [isSignedIn]);
  // The address boxes only appear once shipping is chosen: fill them then.
  useEffect(() => {
    fillEmpty(formRef.current, defaults.current);
    const pc = formRef.current?.elements.namedItem("postalCode");
    if (pc instanceof HTMLInputElement && pc.value) setPostal(pc.value);
  }, [fulfilment]);

  // Live Canada Post prices once the address has a country and a postal code
  // (Vee, 2026-11-09). Waits for the customer to stop typing.
  const ship = fulfilment === "ship";
  const rule = POSTAL_RULES[country];
  const postalOk = rule ? rule.re.test(postal.trim()) : true;
  const cartKey = lines.map((l) => `${l.id}x${l.qty}`).join(",");
  useEffect(() => {
    if (!ship || !postalOk) return;
    let live = true;
    const t = setTimeout(() => {
      setRates((r) => ({ ...r, state: "loading", message: "" }));
      quoteShipping({
        lines: lines.map((l) => ({ productId: l.productId, sizeId: l.sizeId, candyIds: l.candies?.map((c) => c.id), qty: l.qty })),
        country,
        postalCode: postal,
      })
        .then((r) => {
          if (!live) return;
          if (r.ok) {
            setRates({ state: "ok", quotes: r.quotes, message: "" });
            setSpeed((s) => (r.quotes.some((q) => q.speed === s) ? s : r.quotes[0].speed));
          } else setRates({ state: "error", quotes: [], message: r.message });
        })
        .catch(() => live && setRates({ state: "error", quotes: [], message: "We couldn’t get shipping prices just now. Please try again." }));
    }, 600);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ship, country, postal, postalOk, cartKey]);
  const quote = ship && rates.state === "ok" ? rates.quotes.find((q) => q.speed === speed) ?? null : null;

  const isPickup = fulfilment === "pickup" || fulfilment === "pickup_express";
  const expressPickup = fulfilment === "pickup_express" && expressPickupCents != null;
  const cashOk = cash && isPickup;
  const payment = cashOk ? chosenPayment : "etransfer";

  // Estimate only: the server works out the real total (and checks the code).
  const discountCents = Math.round((subtotalCents * promo.percent) / 100);
  const afterDiscountCents = subtotalCents - discountCents;
  const deliveryCents = ship ? quote?.cents ?? 0 : expressPickup ? expressPickupCents! : 0;

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
        fulfilment: ship ? speed : fulfilment,
        street: get("street"),
        city: get("city"),
        province: get("province"),
        postalCode: get("postalCode"),
        country,
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
      ref={formRef}
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
            <Input {...props("name")} autoComplete="name" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="email" label="Email" required error={errors.email}>
              <Input type="email" {...props("email")} autoComplete="email" />
            </Field>
            <Field id="phone" label="Phone" required error={errors.phone}>
              <Input type="tel" {...props("phone")} autoComplete="tel" />
            </Field>
          </div>
        </section>

        <section className={`space-y-4 ${panel}`}>
          <h2 className="text-3xl">2. Pickup or shipping</h2>
          <div role="radiogroup" aria-label="Pickup or shipping" className="grid gap-3">
            {pickup && (
              <Choice
                name="fulfilment"
                value="pickup"
                checked={fulfilment === "pickup"}
                onChange={setFulfilment}
                title={`${expressPickupCents != null ? "Regular pickup" : "Pickup"} in ${pickup} · Free`}
                detail={`Ready in ${pickupDays.regular}. We’ll email you the address and a time when it’s ready.`}
              />
            )}
            {pickup && expressPickupCents != null && (
              <Choice
                name="fulfilment"
                value="pickup_express"
                checked={fulfilment === "pickup_express"}
                onChange={setFulfilment}
                title={`⚡ Express pickup · +${formatPrice(expressPickupCents)}`}
                detail={`Ready in ${pickupDays.express}. We’ll email you the address and a time when it’s ready.`}
              />
            )}
            {shipping && (
              <Choice name="fulfilment" value="ship" checked={ship} onChange={setFulfilment} title={`Ship it with ${shipping}`} detail={`${shippingArea} Add your address to see the shipping price.`.trim()} />
            )}
          </div>
          {errors.fulfilment && <p className="text-sm font-semibold text-pink-deep">{errors.fulfilment}</p>}
          {ship && (
            <div className="space-y-5 pt-2">
              <Field id="country" label="Country" required error={errors.country}>
                <Select {...props("country")} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country">
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </Field>
              <Field id="street" label="Street address" required error={errors.street}>
                <Input {...props("street")} autoComplete="street-address" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="city" label="Town / city" required error={errors.city}>
                  <Input {...props("city")} autoComplete="address-level2" />
                </Field>
                <Field id="province" label={country === "US" ? "State" : country === "CA" ? "Province" : "Province / region"} required={country === "CA" || country === "US"} error={errors.province}>
                  <Input {...props("province")} autoComplete="address-level1" />
                </Field>
                <Field id="postalCode" label={rule?.label ?? "Postal code"} required={Boolean(rule)} error={errors.postalCode}>
                  <Input {...props("postalCode")} autoComplete="postal-code" autoCapitalize="characters" placeholder={rule?.example} onInput={(e) => setPostal(e.currentTarget.value)} />
                </Field>
              </div>

              {/* Canada Post Standard / Express with the live price */}
              <div aria-live="polite">
                {!postalOk && rates.state !== "ok" && <p className="text-sm font-medium text-ink-soft">Add your {rule?.label.toLowerCase() ?? "postal code"} to see shipping prices.</p>}
                {postalOk && rates.state === "loading" && <p className="text-sm font-bold text-ink-soft">Getting shipping prices…</p>}
                {postalOk && rates.state === "error" && <p className="rounded-xl bg-pink-soft px-4 py-3 text-sm font-semibold text-pink-deep">{rates.message}</p>}
                {postalOk && rates.state === "ok" && (
                  <div role="radiogroup" aria-label="Shipping speed" className="grid gap-3 sm:grid-cols-2">
                    {rates.quotes.map((q) => (
                      <Choice
                        key={q.speed}
                        name="speed"
                        value={q.speed}
                        checked={speed === q.speed}
                        onChange={(v) => setSpeed(v as "standard" | "express")}
                        title={`${q.speed === "express" ? "Express" : "Standard"} · ${q.cents === 0 ? "Free" : formatPrice(q.cents)}`}
                        detail={`${q.service}${days(q.days)}`}
                      />
                    ))}
                  </div>
                )}
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
                {l.candies && describeExtras(l.candies) && <span className="block text-sm font-bold text-pink-deep">Extra candy: {describeExtras(l.candies)}</span>}
              </span>
              <span className="font-bold whitespace-nowrap">{formatPrice(l.unitPriceCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t-[3px] border-ink pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{formatPrice(subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt>{ship ? "Shipping" : expressPickup ? "Express pickup" : "Pickup"}</dt><dd className="font-bold">{ship ? (quote ? (quote.cents === 0 ? "Free" : formatPrice(quote.cents)) : "Add address") : expressPickup ? formatPrice(expressPickupCents!) : "Free"}</dd></div>
          {discountCents > 0 && <div className="flex justify-between"><dt>Promo {code} ({promo.percent}% off)</dt><dd className="font-bold">−{formatPrice(discountCents)}</dd></div>}
          <div className="flex justify-between text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{formatPrice(afterDiscountCents + deliveryCents)}</dd></div>
        </dl>
        <PromoCode initialCode={saved} onChange={(c, percent) => { setPromo({ code: c, percent }); setErrors((e) => ({ ...e, code: "" })); }} />
        {errors.code && (
          <p role="alert" className="mt-3 rounded-xl bg-pink-soft px-4 py-3 text-sm font-semibold text-pink-deep">
            {errors.code}
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
            {order.payWithinHours && <li>Please send it within <b>{order.payWithinHours} hours</b>, or your order will be cancelled.</li>}
          </ol>
        ) : (
          <p className="text-lg font-medium">Bring <b>{total}</b> in cash when you pick up your order.</p>
        )}
        <p className="font-medium text-ink-soft">
          {order.payment === "etransfer" ? "We start packing as soon as your payment arrives. " : ""}
          {order.fulfilment === "pickup"
            ? `Pickup is in ${pickup ?? "Vaughan"}. You’ll be notified by email when your order is ready for pickup, with the address and a time.`
            : "You’ll be notified by email when your order has shipped, with your tracking number."}
        </p>
      </div>

      <div className={`${panel} space-y-2`}>
        <dl className="space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{formatPrice(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 && <div className="flex justify-between"><dt>Discount</dt><dd className="font-bold">−{formatPrice(order.discountCents)}</dd></div>}
          <div className="flex justify-between"><dt>{order.fulfilment === "delivery" ? "Shipping" : order.expressPickup ? "Express pickup" : "Pickup"}</dt><dd className="font-bold">{order.deliveryCents ? formatPrice(order.deliveryCents) : "Free"}</dd></div>
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
