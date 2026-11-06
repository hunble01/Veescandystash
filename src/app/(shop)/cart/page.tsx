import type { Metadata } from "next";
import { CartSuggestions } from "./CartSuggestions";
import { CartView } from "./CartView";
import { site } from "@/config/site";
import { getProducts } from "@/lib/catalog";
import { Container, DraftNote, PageHeader } from "@/components/ui";
import { checkoutBlockers } from "@/lib/readiness";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const blockers = checkoutBlockers();
  const products = await getProducts();
  return (
    <>
      <PageHeader eyebrow="Your cart" title="Your stash." />
      <Container className="pb-20">
        <CartView checkoutOpen={blockers.length === 0} welcomePercent={site.welcomeDiscountPercent} />
        <CartSuggestions products={products} />
        {/* Only shown while developing, so customers never see setup notes. */}
        {process.env.NODE_ENV !== "production" && blockers.length > 0 && (
          <div className="mt-10 max-w-2xl">
            <DraftNote>Checkout is closed until: {blockers.join(" · ")}. (This note only shows in development.)</DraftNote>
          </div>
        )}
      </Container>
    </>
  );
}
