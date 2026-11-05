import type { Metadata } from "next";
import { ShopGrid } from "./ShopGrid";
import { Container, DraftNote, PageHeader } from "@/components/ui";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Candy Bags",
  description: "Signature, sour, sweet and build-your-own candy bags.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <>
      <PageHeader eyebrow="Shop" title="Pick your stash." intro="Ready-made mixes for gifting, snacking or just because, or build your own." />
      <Container className="py-12">
        <div className="mb-8">
          <DraftNote>Sizes, prices and availability will appear here once they’re confirmed.</DraftNote>
        </div>
        <ShopGrid products={products} />
      </Container>
    </>
  );
}
