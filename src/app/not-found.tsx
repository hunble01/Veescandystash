import { ShopShell } from "@/components/ShopShell";
import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <ShopShell>
      <Container className="max-w-xl py-24 text-center">
        <p className="font-retro text-8xl text-orange text-pop">404</p>
        <h1 className="mt-6 text-4xl">This page got snacked on.</h1>
        <p className="mt-3 text-lg font-medium text-ink-soft">We couldn’t find what you were looking for.</p>
        <ButtonLink href="/" className="mt-8">Back to the shop</ButtonLink>
      </Container>
    </ShopShell>
  );
}
