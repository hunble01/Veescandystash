"use server";

import { randomUUID } from "node:crypto";
import { currentUserId } from "@/lib/account";
import { emailConfigured, notifyOwner, type Attachment } from "@/lib/notify";
import {
  customOrderFields, photoError, readFiles, readForm, themeOrderFields,
  validateContact, validateCustomOrder, validateThemeOrder, type Errors,
} from "@/lib/validation";
import { writeClient } from "@/sanity/client";

export type FormResult =
  | { status: "sent" }
  | { status: "invalid"; errors: Errors }
  | { status: "not_configured" }
  | { status: "error" };

// Hidden "website" field: people never fill it in, spam bots usually do.
const isBot = (data: FormData) => Boolean(String(data.get("website") ?? "").trim());

type Doc = { _type: string; [k: string]: unknown };

// Uploads any photos to Sanity first, so they show on the request in the Studio.
async function save(doc: Doc, prefix: string, files: Attachment[]) {
  if (!writeClient) return false;
  const client = writeClient;
  const photos = await Promise.all(
    files.map(async (f) => {
      const asset = await client.assets.upload("image", f.content, { filename: f.filename });
      return { _type: "image", _key: randomUUID().slice(0, 8), asset: { _type: "reference", _ref: asset._id } };
    }),
  );
  await client.create({ _id: `${prefix}.${randomUUID()}`, ...doc, ...(photos.length ? { photos } : {}) });
  return true;
}

// Saves to Sanity (Vee's inbox) and emails her. Succeeds if either works,
// so one service being down doesn't lose a request.
async function deliver(doc: Doc, prefix: string, email: () => Promise<boolean>, files: Attachment[] = []) {
  if (!writeClient && !emailConfigured) return "not_configured" as const;
  const results = await Promise.allSettled([save(doc, prefix, files), email()]);
  results.forEach((r) => r.status === "rejected" && console.error(`Saving ${doc._type} failed:`, r.reason));
  return results.some((r) => r.status === "fulfilled" && r.value) ? ("sent" as const) : ("error" as const);
}

export async function submitCustomOrder(data: FormData): Promise<FormResult> {
  if (isBot(data)) return { status: "sent" };
  const v = readForm(data, customOrderFields);
  const photos = readFiles(data, "photos");
  const errors = validateCustomOrder(v);
  const photoProblem = photoError(photos);
  if (photoProblem) errors.photos = photoProblem;
  if (Object.keys(errors).length) return { status: "invalid", errors };
  const files = await Promise.all(photos.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) })));

  // Dotted ids keep these documents off Sanity's public API.
  const status = await deliver(
    { _type: "customEnquiry", status: "new", createdAt: new Date().toISOString(), source: "Custom orders page", ...v, quantity: Number(v.quantity), userId: (await currentUserId()) ?? "" },
    "enquiries",
    () =>
      notifyOwner(
        `🎉 New custom order request: ${v.occasion}, ${v.quantity} bags, ${v.eventDate}`,
        [
          ["Name", v.name], ["Email", v.email], ["Phone", v.phone], ["Occasion", v.occasion],
          ["Event date", v.eventDate], ["Quantity", v.quantity], ["Bag size", v.size], ["Colours / theme", v.theme],
          ["Candy mix", v.mix], ["Label wording", v.label],
          ["Packaging extras", v.packaging], ["Budget", v.budget], ["Pickup or delivery", v.fulfilment],
          ["Town / city", v.area], ["Anything else", v.notes],
          ["Inspiration photos", files.length ? `${files.length} attached` : ""],
        ],
        v.email,
        files,
      ),
    files,
  );
  return { status };
}

// Occasion and holiday pages' short form. Lands in the same inbox as custom
// requests, marked with where it came from.
export async function submitThemeOrder(data: FormData): Promise<FormResult> {
  if (isBot(data)) return { status: "sent" };
  const v = readForm(data, themeOrderFields);
  const errors = validateThemeOrder(v);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const { requests, ...rest } = v;
  const status = await deliver(
    {
      _type: "customEnquiry", status: "new", createdAt: new Date().toISOString(), source: "Occasion / holiday page",
      ...rest, notes: requests, quantity: Number(v.quantity), userId: (await currentUserId()) ?? "",
    },
    "enquiries",
    () =>
      notifyOwner(
        `🍬 New ${v.occasion} order request: ${v.theme}, ${v.quantity} bags, needed ${v.eventDate}`,
        [
          ["Name", v.name], ["Email", v.email], ["Phone", v.phone], ["Occasion / holiday", v.occasion],
          ["Theme", v.theme], ["Quantity", v.quantity], ["Bag size", v.size], ["Needed by", v.eventDate],
          ["Tag message", v.label], ["Special requests", v.requests], ["Pickup or delivery", v.fulfilment],
        ],
        v.email,
      ),
  );
  return { status };
}

export async function submitContact(data: FormData): Promise<FormResult> {
  if (isBot(data)) return { status: "sent" };
  const v = readForm(data, ["name", "email", "message"] as const);
  const errors = validateContact(v);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const status = await deliver(
    { _type: "contactMessage", handled: false, createdAt: new Date().toISOString(), ...v },
    "messages",
    () => notifyOwner(`💌 New message from ${v.name}`, [["Name", v.name], ["Email", v.email], ["Message", v.message]], v.email),
  );
  return { status };
}
