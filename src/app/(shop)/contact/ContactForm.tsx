"use client";

import { useState, useTransition } from "react";
import { submitContact } from "../actions";
import { Field, Input, Textarea, describedBy } from "@/components/form";
import { Button, DraftNote } from "@/components/ui";
import { readForm, validateContact, type Errors } from "@/lib/validation";

type Result = "sent" | "not_configured" | "error" | null;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Result>(null);
  const [sending, startSending] = useTransition();

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const errs = validateContact(readForm(data, ["name", "email", "message"] as const));
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) return form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    startSending(async () => {
      const r = await submitContact(data);
      if (r.status === "invalid") setErrors(r.errors);
      else setResult(r.status);
    });
  }

  const panel = "rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8";

  if (result === "sent") {
    return (
      <div role="status" className={panel}>
        <p className="font-display text-5xl text-orange text-pop">Thanks!</p>
        <h2 className="mt-4 text-3xl">Your message is on its way.</h2>
        <p className="mt-3 text-lg font-medium text-ink-soft">Vee will reply by email.</p>
      </div>
    );
  }

  const props = (k: string) => ({
    id: k,
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": describedBy(k, { error: errors[k] }),
  });

  return (
    <form noValidate onSubmit={onSubmit} className={`relative space-y-5 ${panel}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" required error={errors.name}>
          <Input {...props("name")} autoComplete="name" />
        </Field>
        <Field id="email" label="Email" required error={errors.email}>
          <Input type="email" {...props("email")} autoComplete="email" />
        </Field>
      </div>
      <Field id="message" label="Message" required error={errors.message}>
        <Textarea {...props("message")} rows={6} />
      </Field>
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {result === "not_configured" && (
        <DraftNote>Website preview: sending isn’t connected yet (needs Sanity or email set up). Nothing was sent.</DraftNote>
      )}
      {result === "error" && (
        <p role="alert" className="rounded-xl bg-pink-soft px-4 py-3 font-semibold text-pink-deep">
          Sorry, that didn’t send. Please try again in a moment.
        </p>
      )}
      <Button type="submit" disabled={sending} className="w-full sm:w-auto">
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
