"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { submitCustomOrder } from "../actions";
import { Field, Input, Select, Textarea, describedBy } from "@/components/form";
import { Button, DraftNote } from "@/components/ui";
import { site } from "@/config/site";
import { PHOTO_MAX, customOrderFields, photoError, readForm, validateCustomOrder, type Errors } from "@/lib/validation";

// Two steps: fill in, then review and send. The form stays mounted (just
// hidden) during review so "Edit request" keeps everything they typed.

const packagingChoices = ["Occasion sticker or tag", "Ribbon", "Thank-you card", "Gift box"];
const mixChoices = ["Sweet", "Sour", "Sweet + Sour", "No preference"];
const fulfilmentChoices = ["Pickup", "Delivery", "Not sure yet"];

const labels: Record<(typeof customOrderFields)[number], string> = {
  name: "Name", email: "Email", phone: "Phone", occasion: "Occasion", eventDate: "Event date",
  quantity: "Quantity", size: "Bag size", theme: "Colours / theme", mix: "Candy mix",
  label: "Label wording", packaging: "Packaging extras",
  budget: "Budget", fulfilment: "Pickup or delivery", area: "Town / city", notes: "Anything else",
};

type Step = "edit" | "review" | "sent" | "not_configured" | "error";

// Phone photos are often several MB. Shrink to at most 1600px on the long
// side as a JPEG before sending; if the browser can't read the file (some
// HEIC photos), send it as it is and let the size check decide.
const MAX_SIDE = 1600;

async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function CustomOrderForm({ occasions }: { occasions: { slug: string; name: string }[] }) {
  const params = useSearchParams();
  const preset = occasions.find((o) => o.slug === params.get("occasion"))?.name ?? "";
  // Logged-in customers get their name and email filled in (still editable).
  const { user } = useUser();

  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<Step>("edit");
  const [pending, setPending] = useState<FormData | null>(null);
  const [sending, startSending] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  // Kept here rather than in the file input, so photos can be previewed,
  // removed one at a time and sent already shrunk.
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [preparing, setPreparing] = useState(false);

  function showErrors(errs: Errors) {
    setErrors(errs);
    setStep("edit");
    const first = customOrderFields.find((f) => errs[f]);
    if (first) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
    else if (errs.photos) requestAnimationFrame(() => document.getElementById("photos")?.focus());
  }

  async function addPhotos(ev: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(ev.target.files ?? []);
    ev.target.value = "";
    if (!chosen.length) return;
    const room = PHOTO_MAX - photos.length;
    setPreparing(true);
    const ready = await Promise.all(chosen.slice(0, room).map(shrinkPhoto));
    setPreparing(false);
    const next = [...photos, ...ready.map((file) => ({ file, url: URL.createObjectURL(file) }))];
    setPhotos(next);
    setErrors((e) => ({ ...e, photos: chosen.length > room ? `You can add up to ${PHOTO_MAX} photos.` : photoError(next.map((p) => p.file)) }));
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(photos[i].url);
    const next = photos.filter((_, j) => j !== i);
    setPhotos(next);
    setErrors((e) => ({ ...e, photos: photoError(next.map((p) => p.file)) }));
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    photos.forEach((p) => data.append("photos", p.file));
    const errs = validateCustomOrder(readForm(data, customOrderFields));
    const photoProblem = photoError(photos.map((p) => p.file));
    if (photoProblem) errs.photos = photoProblem;
    if (Object.keys(errs).length) return showErrors(errs);
    setErrors({});
    setPending(data);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function send() {
    if (!pending) return;
    startSending(async () => {
      const result = await submitCustomOrder(pending);
      if (result.status === "invalid") showErrors(result.errors);
      else setStep(result.status);
    });
  }

  const summary = pending
    ? Object.entries(readForm(pending, customOrderFields)).filter(([, v]) => v)
    : [];

  const panel = "rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8";

  if (step === "sent") {
    return (
      <div className={panel} role="status">
        <p className="font-display text-5xl text-orange text-pop">Yay!</p>
        <h2 className="mt-4 text-3xl">Your request is on its way to Vee.</h2>
        <p className="mt-3 text-lg font-medium text-ink-soft">She’ll get back to you by email with ideas and a quote.</p>
      </div>
    );
  }

  const review = step !== "edit" && (
    <div className={panel} role="status">
      <h2 className="text-3xl">Here’s your request</h2>
      <p className="mt-2 font-medium text-ink-soft">Check everything looks right, then send it to Vee.</p>
      <dl className="mt-6 divide-y divide-line">
        {summary.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-3">
            <dt className="font-bold">{labels[k as keyof typeof labels]}</dt>
            <dd className="whitespace-pre-wrap text-ink-soft sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>
      {photos.length > 0 && (
        <div className="grid gap-2 border-t border-line py-3 sm:grid-cols-3">
          <p className="font-bold">Inspiration photos</p>
          <ul className="flex flex-wrap gap-3 sm:col-span-2">
            {photos.map((p, i) => (
              <li key={p.url}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the customer's own file */}
                <img src={p.url} alt={`Inspiration photo ${i + 1}`} className="h-20 w-20 rounded-xl border-2 border-ink object-cover" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {step === "not_configured" && (
        <div className="mt-6">
          <DraftNote>Website preview: sending isn’t connected yet (needs Sanity or email set up). Nothing was sent.</DraftNote>
        </div>
      )}
      {step === "error" && (
        <p role="alert" className="mt-6 rounded-xl bg-pink-soft px-4 py-3 font-semibold text-pink-deep">
          Sorry, that didn’t send. Please try again in a moment.
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send to Vee"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setStep("edit")} disabled={sending}>
          Edit request
        </Button>
      </div>
    </div>
  );

  const err = (k: string) => errors[k];
  const a11y = (k: string, hasHint = false) => ({
    id: k,
    name: k,
    "aria-invalid": err(k) ? true : undefined,
    "aria-describedby": describedBy(k, { hint: hasHint, error: err(k) }),
  });

  return (
    <>
    {review}
    <form ref={formRef} noValidate onSubmit={onSubmit} hidden={step !== "edit"} className="space-y-10 rounded-[var(--radius-card)] bg-white p-6 border-[3px] border-ink shadow-[var(--shadow-pop)] sm:p-8">
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-xl bg-pink-soft px-4 py-3 font-semibold text-pink-deep">
          A few details need another look.
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold"><span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-teal text-base text-ink">1</span>Your event</legend>
        <Field id="occasion" label="Occasion" required error={err("occasion")}>
          <Input {...a11y("occasion")} defaultValue={preset} placeholder="e.g. Mia’s 5th birthday, a wedding, a company party" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="eventDate" label="Event date" required error={err("eventDate")}>
            <Input type="date" {...a11y("eventDate")} />
          </Field>
          <Field id="quantity" label="How many bags?" required error={err("quantity")}>
            <Input type="number" inputMode="numeric" min={site.customOrders.minimumQuantity ?? 1} {...a11y("quantity")} />
          </Field>
        </div>
        <Field id="size" label="Bag size" hint="Not sure? Leave it and we’ll suggest one.">
          <Select {...a11y("size", true)} defaultValue="">
            <option value="">Not sure yet</option>
            {site.bagSizes.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold"><span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-teal text-base text-ink">2</span>Make it yours</legend>
        <Field id="theme" label="Colours or theme">
          <Input {...a11y("theme")} placeholder="e.g. peach and pink, dinosaurs, pastel rainbow" />
        </Field>
        <div>
          <p className="mb-1.5 font-semibold">
            Inspiration photos <span className="text-sm font-normal text-ink-soft">(optional)</span>
          </p>
          <p id="photos-hint" className="mb-3 text-sm text-ink-soft">
            Your party theme, colours, invitation or anything that shows the look you want. Up to {PHOTO_MAX} photos.
          </p>
          {photos.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-4">
              {photos.map((p, i) => (
                <li key={p.url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the customer's own file */}
                  <img src={p.url} alt={`Inspiration photo ${i + 1}`} className="h-24 w-24 rounded-xl border-[3px] border-ink object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-white text-lg font-extrabold hover:bg-pink-soft"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {photos.length < PHOTO_MAX && (
            <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-[3px] border-dashed border-ink/70 bg-cream px-5 font-bold transition hover:bg-orange-soft has-focus-visible:outline-3 has-focus-visible:outline-teal">
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={addPhotos}
                disabled={preparing}
                aria-invalid={err("photos") ? true : undefined}
                aria-describedby={describedBy("photos", { hint: true, error: err("photos") })}
                className="sr-only"
              />
              <span aria-hidden>📷</span>
              {preparing ? "Getting photos ready…" : photos.length ? "Add another photo" : "Add photos"}
            </label>
          )}
          {err("photos") && (
            <p id="photos-error" className="mt-1.5 text-sm font-semibold text-pink-deep">
              {err("photos")}
            </p>
          )}
        </div>
        <fieldset>
          <legend className="mb-2 font-semibold">Candy mix <span className="text-sm font-normal text-ink-soft">(optional)</span></legend>
          <div className="flex flex-wrap gap-2">
            {mixChoices.map((m) => (
              <label key={m} className="cursor-pointer rounded-full px-4 py-2.5 font-medium border-[3px] border-ink/80 has-checked:bg-orange-soft has-checked:border-ink has-checked:shadow-[var(--shadow-pop)] has-focus-visible:outline-3 has-focus-visible:outline-teal">
                <input type="radio" name="mix" value={m} className="sr-only" /> {m}
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="label" label="Label or sticker wording" hint="Names, date, a thank-you or a short message.">
          <Input {...a11y("label", true)} placeholder="e.g. Thanks for coming to Mia’s 5th!" />
        </Field>
        <fieldset>
          <legend className="mb-2 font-semibold">Packaging extras <span className="text-sm font-normal text-ink-soft">(where offered)</span></legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {packagingChoices.map((p) => (
              <label key={p} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-4 border-[3px] border-ink/80 has-checked:bg-teal-soft has-checked:border-ink has-checked:shadow-[var(--shadow-pop)]">
                <input type="checkbox" name="packaging" value={p} className="h-5 w-5 accent-teal-deep" /> {p}
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="budget" label="Budget range">
          <Input {...a11y("budget")} placeholder="e.g. around $100" />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold"><span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-teal text-base text-ink">3</span>Getting it to you</legend>
        <Field id="fulfilment" label="Pickup or delivery?">
          <Select {...a11y("fulfilment")} defaultValue="">
            <option value="">Choose one…</option>
            {fulfilmentChoices.map((f) => <option key={f}>{f}</option>)}
          </Select>
        </Field>
        <Field id="area" label="Your town or city">
          <Input {...a11y("area")} autoComplete="address-level2" />
        </Field>
        <Field id="notes" label="Anything else?" hint="Inspiration links, questions, anything that helps.">
          <Textarea {...a11y("notes", true)} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold"><span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-teal text-base text-ink">4</span>Your details</legend>
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
      </fieldset>

      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Button type="submit" className="w-full sm:w-auto">Review my request</Button>
    </form>
    </>
  );
}
