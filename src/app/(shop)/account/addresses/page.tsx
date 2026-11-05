import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import { redirect } from "next/navigation";
import { AddressBook } from "@/components/account/AddressBook";
import { PageTitle } from "@/components/account/parts";
import { MAX_ADDRESSES, getAddresses, getCustomer } from "@/lib/account";

export const metadata: Metadata = { title: "My addresses", robots: { index: false } };

async function AddressesPageContent() {
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const addresses = await getAddresses(customer.id);

  return (
    <div>
      <PageTitle
        title="Addresses"
        intro="Save the places you send candy to: home, work, or wherever the party is. Only you can see these."
      />
      <AddressBook initial={addresses} max={MAX_ADDRESSES} />
    </div>
  );
}

// Per-customer data loads at request time, so it streams in behind a placeholder.
export default function AddressesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AddressesPageContent />
    </Suspense>
  );
}
