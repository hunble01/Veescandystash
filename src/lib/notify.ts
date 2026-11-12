import { Resend } from "resend";

// Emails Vee about new orders, requests and messages. Customer emails sent from
// here: the welcome code, e-Transfer/cash order instructions (a full receipt with how to pay) (card receipts
// would come from Stripe). Customer emails need the sender's domain verified
// in Resend; until then only Vee's own notifications arrive.

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

// The price breakdown as a small table (subtotal, discount, pickup/shipping, total).
function totalsTable(totals: [string, string][]) {
  return `<table cellpadding="4" style="border-collapse:collapse;font-size:16px;margin:8px 0">${totals
    .map(([k, v], i) => {
      const last = i === totals.length - 1;
      const style = last ? "font-weight:bold;font-size:18px;border-top:2px solid #2b1d17" : "";
      return `<tr><td style="${style};padding-right:24px">${escape(k)}</td><td style="${style};text-align:right">${escape(v)}</td></tr>`;
    })
    .join("")}</table>`;
}

const box = (text: string) =>
  `<p style="font-size:22px;font-weight:bold;background:#fde0cb;border:3px solid #2b1d17;border-radius:16px;padding:10px 18px;display:inline-block">${text}</p>`;

async function sendCustomer(email: string, subject: string, html: string, what: string) {
  if (!apiKey) return false;
  const { error } = await new Resend(apiKey).emails.send({ from, to: email, subject, html, ...(to ? { replyTo: to } : {}) });
  if (error) {
    console.error(`${what} email failed:`, error.message);
    return false;
  }
  return true;
}

const wrap = (body: string) => `<div style="font-family:sans-serif;font-size:16px;line-height:1.5;color:#2b1d17;background:#fffaf3;padding:16px 20px;border-radius:16px;max-width:520px">${body}
  <p>Questions? Just reply to this email.</p>
  <p>Every sweet tooth needs a stash 🍬<br>Vee</p>
</div>`;

// Order confirmation with how to pay (e-Transfer or cash), Vee 2026-11-08.
// Now also a full receipt: items, subtotal, discount, pickup/shipping, total
// (Vee, 2026-11-12).
export async function sendOrderInstructions(
  email: string,
  o: { firstName: string; orderNumber: string; total: string; items: string[]; paymentHtml: string; fulfilment: string; totals: [string, string][] },
) {
  const html = wrap(`
  <p>${o.firstName ? `Hi ${escape(o.firstName)},` : "Hi there,"}</p>
  <p>Thank you for your order! Here are the details.</p>
  ${box(`Order ${escape(o.orderNumber)} · ${escape(o.total)}`)}
  <ul>${o.items.map((i) => `<li>${escape(i)}</li>`).join("")}</ul>
  ${totalsTable(o.totals)}
  ${o.paymentHtml}
  <p>${escape(o.fulfilment)}</p>`);
  return sendCustomer(email, `Your Vee’s Candy Stash order ${o.orderNumber}`, html, "Order");
}

export { escape as escapeHtml };
