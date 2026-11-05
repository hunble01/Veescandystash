"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { submitThemeOrder } from "@/app/(shop)/actions";
import { Field, Input, Select, Textarea, describedBy } from "@/components/form";
import { Button, DraftNote } from "@/components/ui";
import { site } from "@/config/site";
import type { Accent, Theme } from "@/lib/types";
import { earliestThemeDate, readForm, themeOrderFields, validateThemeOrder, type Errors } from "@/lib/validation";

// Short order form on each occasion and holiday page. The theme cards are
// the first question, so "what we offer" and "order it" are one place.
// Bigger events go to the full custom order form instead.

const OTHER = "Something else";

// Written out in full so Tailwind generates them.
const checkedBg: Record<Accent, string> = {
  orange: "has-checked:bg-orange-soft",
  pink: "has-checked:bg-pink-soft",
  teal: "has-checked:bg-teal-soft",
  red: "has-checked:bg-holiday-red-soft",
  green: "has-checked:bg-holiday-green-soft",
  gold: "has-checked:bg-holiday-gold-soft",
};
type Step = "edit" | "sent" | "not_configured" | "error";

export function ThemeOrderForm({ occasion, themes, accent }: { occasion: string; themes: Theme[]; accent: Accent }) {
  const { user } = useUser();
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<Step>("edit");
  const [sending, startSending] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function showErrors(errs: Errors) {
    setErrors(errs);
    setStep("edit");
    const first = themeOrderFields.find((f) => errs[f]);
    if (first) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const errs = validateThemeOrder(readForm(data, themeOrderFields));
    if (Object.keys(errs).length) return showErrors(errs);
    setErrors({});
    startSending(async () => {
      const result = await submitThemeOrder(data);
      if (result.status === "invalid") showErrors(result.errors);
      else setStep(result.status);
    });
  }

  if (step === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8" role="status">
        <p className="font-display text-5xl text-orange text-pop">Yay!</p>
        <h3 className="mt-4 text-3xl">Your order request is on its way to Vee.</h3>
        <p className="mt-3 text-lg font-medium text-ink-soft">She’ll get back to you to confirm the details and price.</p>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const a11y = (k: string, hasHint = false) => ({
    id: k,
    name: k,
    "aria-invalid": err(k) ? true : undefined,
    "aria-describedby": describedBy(k, { hint: hasHint, error: err(k) }),
  });
  const minQty = site.customOrders.minimumQuantity ?? 1;
  const notice = site.customOrders.minNoticeDays;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-10">
      <input type="hidden" name="occasion" value={occasion} />

      <fieldset aria-describedby={err("theme") ? "theme-error" : undefined}>
        <legend className="mb-2 font-display text-3xl">Themes we offer</legend>
        <p className="mb-5 text-ink-soft">Pick one to start. Want something specific? Choose “{OTHER}” and tell us below.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...themes, { name: OTHER, description: "Your own idea: colours, characters or a theme we haven’t listed. Sealed with a custom coloured ribbon." }].map((t) => (
            <label
              key={t.name}
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border-[3px] border-ink bg-white p-5 shadow-[var(--shadow-pop)] transition has-checked:-translate-y-0.5 has-checked:shadow-[var(--shadow-pop-lg)] has-focus-visible:outline-3 has-focus-visible:outline-teal ${checkedBg[accent]}`}
            >
              <span className="flex items-center gap-3">
                <input type="radio" name="theme" value={t.name} className="h-5 w-5 accent-teal-deep" />
                <span className="text-lg font-extrabold">{t.name}</span>
              </span>
              {t.description && <span className="text-ink-soft">{t.description}</span>}
            </label>
          ))}
        </div>
        {err("theme") && <p id="theme-error" className="mt-3 font-semibold text-pink-deep">{err("theme")}</p>}
      </fieldset>

      <fieldset className="space-y-5 rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8">
        <legend className="sr-only">Your order</legend>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="rounded-xl bg-pink-soft px-4 py-3 font-semibold text-pink-deep">A few details need another look.</p>
        )}
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="quantity" label="How many bags?" required error={err("quantity")}>
            <Input type="number" inputMode="numeric" min={minQty} placeholder={`${minQty} or more`} {...a11y("quantity")} />
          </Field>
          <Field id="size" label="Bag size">
            <Select {...a11y("size")} defaultValue="">
              <option value="">Not sure yet</option>
              {site.bagSizes.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field id="eventDate" label="Needed by" required error={err("eventDate")} hint={notice ? `At least ${notice} days from today.` : undefined}>
            <Input type="date" min={earliestThemeDate()} {...a11y("eventDate", Boolean(notice))} />
          </Field>
        </div>
        <Field id="label" label="Message for the tag" hint="Names, a date, a holiday message or a thank-you.">
          <Input {...a11y("label", true)} placeholder="e.g. Happy 7th Birthday, Leo!" />
        </Field>
        <Field id="requests" label="Special requests" hint="Specific colours, characters, candy you’d love or anything else.">
          <Textarea {...a11y("requests", true)} />
        </Field>
        <Field id="fulfilment" label="Pickup or delivery?">
          <Select {...a11y("fulfilment")} defaultValue="">
            <option value="">Choose one…</option>
            {["Pickup in Vaughan", "Delivery", "Not sure yet"].map((f) => <option key={f}>{f}</option>)}
          </Select>
        </Field>
        <Field id="name" label="Name" required error={err("name")}>
          <Input key={user?.id} {...a11y("name")} autoComplete="name" defaultValue={user?.fullName ?? ""} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="email" label="Email" required error={err("email")}>
            <Input key={user?.id} type="email" {...a11y("email")} autoComplete="email" defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""} />
          </Field>
          <Field id="phone" label="Phone">
            <Input type="tel" {...a11y("phone")} autoComplete="tel" />
          </Field>
        </div>

        <div aria-hidden className="absolute -left-[9999px]">
          <label>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* Occasion pricing is quoted per order (Vee, 2026-11-04). */}
        <p className="rounded-2xl border-2 border-teal bg-teal-soft px-4 py-3 text-ink">
          <span className="font-extrabold">How pricing works:</span> occasion bags are priced by how much candy and customization you’d like.
          Send your request and Vee will email you a quote. No commitment until you say yes.
        </p>
        {step === "not_configured" && <DraftNote>Website preview: sending isn’t connected yet. Nothing was sent.</DraftNote>}
        {step === "error" && (
          <p role="alert" className="rounded-xl bg-pink-soft px-4 py-3 font-semibold text-pink-deep">Sorry, that didn’t send. Please try again in a moment.</p>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send my order request"}</Button>
          <p className="text-sm text-ink-soft">
            Planning a bigger event?{" "}
            <Link href="/custom-orders" className="font-semibold text-teal-deep underline underline-offset-4">Use our full custom order form.</Link>
          </p>
        </div>
      </fieldset>
    </form>
  );
}
