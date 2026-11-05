// Form rules shared by the browser (instant feedback) and the server
// (the real check, since browser checks can be bypassed).

import { site } from "@/config/site";

export type Errors = Partial<Record<string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 2000;
const MIN_QTY = site.customOrders.minimumQuantity ?? 1;

export const customOrderFields = [
  "name", "email", "phone", "occasion", "eventDate", "quantity", "size", "theme",
  "mix", "label", "packaging", "budget", "fulfilment", "area", "notes",
] as const;

export type CustomOrderValues = Record<(typeof customOrderFields)[number], string>;

function tooLong(v: Record<string, string>, e: Errors) {
  for (const [k, val] of Object.entries(v)) if (val.length > MAX_LEN) e[k] = "That’s a bit long. Please shorten it.";
}

export function validateCustomOrder(v: CustomOrderValues, today = new Date()): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!v.email.trim()) e.email = "Please add your email so we can reply.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email doesn’t look quite right.";
  if (!v.occasion.trim()) e.occasion = "What’s the occasion?";
  if (!v.eventDate) e.eventDate = "Please add your event date.";
  else if (Number.isNaN(Date.parse(v.eventDate)) || new Date(`${v.eventDate}T23:59`) < today) e.eventDate = "Please choose a date in the future.";
  const qty = Number(v.quantity);
  if (!v.quantity) e.quantity = "Roughly how many bags or favours?";
  else if (!Number.isInteger(qty) || qty < MIN_QTY || qty > 10000) e.quantity = `Custom orders start at ${MIN_QTY} bags.`;
  tooLong(v, e);
  return e;
}

// Short form on each occasion and holiday page: pick a theme, add the
// details. Bigger events use the full custom order form above.
export const themeOrderFields = [
  "occasion", "theme", "quantity", "size", "eventDate", "label", "requests", "fulfilment", "name", "email", "phone",
] as const;

export type ThemeOrderValues = Record<(typeof themeOrderFields)[number], string>;

const MIN_NOTICE_DAYS = site.customOrders.minNoticeDays ?? 0;

// Earliest date (yyyy-mm-dd) a theme order can be needed by.
export function earliestThemeDate(today = new Date()) {
  const d = new Date(today);
  d.setDate(d.getDate() + MIN_NOTICE_DAYS);
  return d.toLocaleDateString("en-CA");
}

export function validateThemeOrder(v: ThemeOrderValues, today = new Date()): Errors {
  const e: Errors = {};
  if (!v.theme) e.theme = "Please pick a theme, or choose “Something else”.";
  const qty = Number(v.quantity);
  if (!v.quantity) e.quantity = "How many bags would you like?";
  else if (!Number.isInteger(qty) || qty < MIN_QTY || qty > 10000) e.quantity = `Orders start at ${MIN_QTY} bags.`;
  if (!v.eventDate) e.eventDate = "When do you need them?";
  else if (Number.isNaN(Date.parse(v.eventDate)) || v.eventDate < earliestThemeDate(today))
    e.eventDate = `We need at least ${MIN_NOTICE_DAYS} days’ notice. Please pick a later date.`;
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!v.email.trim()) e.email = "Please add your email so we can reply.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email doesn’t look quite right.";
  tooLong(v, e);
  return e;
}

// Optional inspiration photos on the custom order form. The browser shrinks
// them before sending, so these limits are generous.
export const PHOTO_MAX = 3;
export const PHOTO_MAX_BYTES = 4 * 1024 * 1024;

export function photoError(files: File[]): string | undefined {
  if (files.length > PHOTO_MAX) return `You can add up to ${PHOTO_MAX} photos.`;
  if (files.some((f) => !f.type.startsWith("image/"))) return "Photos only, please (JPG, PNG and so on).";
  if (files.some((f) => f.size > PHOTO_MAX_BYTES)) return "One of those photos is too big. Please try a smaller one.";
}

// Files from a FormData field, skipping the empty entry browsers send when
// nothing was chosen.
export const readFiles = (data: FormData, field: string) =>
  data.getAll(field).filter((f): f is File => typeof f === "object" && f.size > 0);

export type ContactValues = { name: string; email: string; message: string };

export function validateContact(v: ContactValues): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!EMAIL.test(v.email.trim())) e.email = "Please add a valid email.";
  if (!v.message.trim()) e.message = "What would you like to say?";
  tooLong(v, e);
  return e;
}

// Reads named fields from FormData as trimmed strings; multi-value fields
// (checkbox groups) are joined with commas.
export function readForm<K extends string>(data: FormData, fields: readonly K[]): Record<K, string> {
  return Object.fromEntries(
    fields.map((f) => [f, data.getAll(f).map((v) => String(v).trim()).filter(Boolean).join(", ")]),
  ) as Record<K, string>;
}
