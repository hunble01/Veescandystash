import type { Metadata } from "next";
import { ShopGrid } from "./ShopGrid";
import { Container, PageHeader } from "@/components/ui";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Candy Bags",
  description: "Candy bags and holiday specials from Vee’s Candy Stash.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <>
      <PageHeader eyebrow="Shop" title="Pick your stash." intro="Holiday specials and treats, or build your own bag with the candies you love." />
      <Container className="py-12">
        <ShopGrid products={products} />
      </Container>
    </>
  );
}
