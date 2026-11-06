import { clerkClient } from "@clerk/nextjs/server";
import { site } from "@/config/site";
import { getCustomer, getOrders } from "@/lib/account";
import { sendWelcomeCode } from "@/lib/notify";

// Sends the welcome code email once per account (Vee, 2026-11-05). Called by
// the browser right after a customer logs in; Clerk's private metadata
// remembers that it was sent, so it can never go out twice.
export async function POST() {
  const percent = site.welcomeDiscountPercent;
  if (!percent) return Response.json({ sent: false });
  const customer = await getCustomer();
  if (!customer?.email) return Response.json({ sent: false }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(customer.id);
  if (user.privateMetadata?.welcomeCodeSent) return Response.json({ sent: false, already: true });
  // Existing customers with orders already had their first order.
  if ((await getOrders(customer)).length > 0) {
    await clerk.users.updateUserMetadata(customer.id, { privateMetadata: { welcomeCodeSent: "skipped" } });
    return Response.json({ sent: false });
  }

  const ok = await sendWelcomeCode(customer.email, customer.firstName, site.welcomeCode, percent);
  if (ok) await clerk.users.updateUserMetadata(customer.id, { privateMetadata: { welcomeCodeSent: new Date().toISOString() } });
  return Response.json({ sent: ok });
}
