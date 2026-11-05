import { Suspense } from "react";
import type { Metadata } from "next";
import Loading from "@/app/(shop)/account/loading";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/cards";
import { RemoveFavourite } from "@/components/account/RemoveFavourite";
import { EmptyState, PageTitle } from "@/components/account/parts";
import { getCustomer, getFavouriteIds } from "@/lib/account";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "My favourites", robots: { index: false } };

async function FavouritesPageContent() {
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  const [ids, products] = await Promise.all([getFavouriteIds(customer.id), getProducts()]);
  const saved = ids.map((id) => products.find((p) => p.id === id)).filter((p) => p != null);

  return (
    <div className="space-y-8">
      <PageTitle title="Favourites" intro="The candy bags you’ve saved, ready for next time." />
      {saved.length === 0 ? (
        <EmptyState icon="heart" title="Nothing saved yet" href="/shop" cta="Browse candy bags">
          Tap “Save to favourites” on any candy bag and it’ll wait for you here.
        </EmptyState>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((p) => (
            <div key={p.id} className="flex flex-col gap-3">
              <ProductCard product={p} />
              <div className="flex justify-center">
                <RemoveFavourite productId={p.id} name={p.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Per-customer data loads at request time, so it streams in behind a placeholder.
export default function FavouritesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FavouritesPageContent />
    </Suspense>
  );
}
