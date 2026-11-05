import { Resend } from "resend";

// Emails Vee about new orders, requests and messages. Customer receipts come
// from Stripe, so this only ever emails the shop owner.

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.NOTIFY_EMAIL_TO;
// Resend's shared sender works for testing; switch to an address on your
// own domain once it's verified in Resend.
const from = process.env.NOTIFY_EMAIL_FROM ?? "Vee’s Candy Stash <onboarding@resend.dev>";

export const emailConfigured = Boolean(apiKey && to);

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export type Attachment = { filename: string; content: Buffer };

export async function notifyOwner(
  subject: string,
  rows: [string, string | number | null | undefined][],
  replyTo?: string,
  attachments: Attachment[] = [],
) {
  if (!apiKey || !to) return false;
  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${escape(k)}</td><td style="white-space:pre-wrap">${escape(String(v))}</td></tr>`)
    .join("")}</table>`;
  const { error } = await new Resend(apiKey).emails.send({ from, to, subject, html, replyTo, attachments });
  if (error) {
    console.error("Email notification failed:", error.message);
    return false;
  }
  return true;
}
