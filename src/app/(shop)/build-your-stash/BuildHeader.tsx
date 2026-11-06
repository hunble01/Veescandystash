import Link from "next/link";
import { FunTitle } from "@/components/FunTitle";
import { Container } from "@/components/ui";

// Build Your Stash header (Vee, 2026-11-05): compact, logo-style title.
export function BuildHeader() {
  return (
    <section className="border-b-[3px] border-dashed border-ink/15">
      <Container className="py-8 text-center sm:py-10">
        <FunTitle style="logo" lead="Build Your" main="Stash!" />
        <p className="mx-auto mt-5 max-w-md text-base font-bold text-ink-soft sm:text-lg">
          Choose your bag size, then fill it with the candies you love.
        </p>
        {/* Vee's allergen warning (2026-11-05) */}
        <p className="mx-auto mt-3 max-w-md text-sm font-semibold text-ink-soft">
          Not suitable for severe food allergies. Our candy may contain milk, soy, wheat, peanuts and tree nuts.{" "}
          <Link href="/policies#allergens" className="font-bold text-pink-deep underline underline-offset-4">
            Allergens and ingredients
          </Link>
        </p>
      </Container>
    </section>
  );
}
