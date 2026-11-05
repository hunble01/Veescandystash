import type { Metadata } from "next";
import { Suspense } from "react";
import { StashBuilder } from "./StashBuilder";
import { ColourHeader } from "@/components/ColourHeader";
import { ButtonLink, Container } from "@/components/ui";
import { getCandies, getProducts } from "@/lib/catalog";
import { checkoutOpen } from "@/lib/readiness";

export const metadata: Metadata = {
  title: "Build Your Stash",
  description: "Pick your bag size, then fill it with your favourite candies.",
};

export default async function BuildYourStashPage() {
  const [products, candies] = await Promise.all([getProducts(), getCandies()]);
  const builder = products.find((p) => p.type === "builder");

  return (
    <>
      <ColourHeader tag="Pick · Mix · Enjoy" title="Build Your" highlight="Stash!" intro="Choose your bag size, then fill it with the candies you love." />

      <Container className="py-12">
        {builder ? (
          // The builder reads the chosen bag from the address (?bag=…).
          <Suspense>
            <StashBuilder product={builder} candies={candies} orderingOpen={checkoutOpen()} />
          </Suspense>
        ) : (
          <div className="mx-auto max-w-lg py-10 text-center">
            <h2 className="text-4xl">Coming soon.</h2>
            <p className="mt-3 text-lg font-medium text-ink-soft">The stash builder is getting ready. Need something now?</p>
            <ButtonLink href="/custom-orders" className="mt-8">Request a custom bag</ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
