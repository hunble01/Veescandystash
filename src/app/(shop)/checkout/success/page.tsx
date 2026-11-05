import type { Metadata } from "next";
import { ClearCart } from "./ClearCart";
import { GummyBear, PeachRing, Sparkle, candyColours as k } from "@/components/Candies";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Thank you!", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <Container className="relative max-w-2xl py-20 text-center sm:py-28">
      <ClearCart />
      <GummyBear c={k.orange} aria-hidden className="absolute top-10 left-2 w-16 -rotate-12 animate-float sm:w-20" />
      <PeachRing aria-hidden className="absolute top-16 right-2 w-16 rotate-12 animate-float [animation-delay:-2s] sm:w-20" />
      <Sparkle c={k.teal} aria-hidden className="mx-auto w-10" />
      <h1 className="mt-6 text-[clamp(2.8rem,10vw,5rem)]">
        Your stash is <span className="text-orange text-pop">on its way!</span>
      </h1>
      <p className="mt-6 text-lg font-medium text-ink-soft sm:text-xl">
        Thank you for your order. A receipt is on its way to your email, and Vee will be in touch about pickup or delivery.
      </p>
      <ButtonLink href="/shop" className="mt-10">Keep browsing</ButtonLink>
    </Container>
  );
}
