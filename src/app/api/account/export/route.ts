import { exportCustomerData, getCustomer } from "@/lib/account";

// "Download my data" on the Profile & security page: a JSON copy of
// everything the logged-in customer's account holds.
export async function GET() {
  const customer = await getCustomer();
  if (!customer) return new Response("Please log in.", { status: 401 });
  const data = await exportCustomerData(customer);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="vees-candy-stash-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
