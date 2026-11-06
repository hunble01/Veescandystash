import { Resend } from "resend";

// Emails Vee about new orders, requests and messages. Customer receipts come
// from Stripe. The one customer email sent from here is the welcome code.

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

// Welcome email with the first-order code (Vee, 2026-11-05). Needs the
// sender's domain verified in Resend before it can reach customers.
export async function sendWelcomeCode(email: string, firstName: string, code: string, percent: number) {
  if (!apiKey) return false;
  const hi = firstName ? `Hi ${escape(firstName)},` : "Hi there,";
  const html = `<div style="font-family:sans-serif;font-size:16px;line-height:1.5;color:#2b1d17;max-width:480px">
  <p>${hi}</p>
  <p>Welcome to Vee’s Candy Stash! Thanks for creating an account. Here’s ${percent}% off your first order:</p>
  <p style="font-size:28px;font-weight:bold;letter-spacing:2px;background:#fde0cb;border:3px solid #2b1d17;border-radius:16px;padding:12px 20px;display:inline-block">${escape(code)}</p>
  <p>Log in, add your treats to your cart, and type the code in the cart before you check out.</p>
  <p>The code works once, on your first order.</p>
  <p>Every sweet tooth needs a stash 🍬<br>Vee</p>
</div>`;
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to: email,
    subject: `Your ${percent}% off code from Vee’s Candy Stash`,
    html,
    ...(to ? { replyTo: to } : {}),
  });
  if (error) {
    console.error("Welcome email failed:", error.message);
    return false;
  }
  return true;
}
