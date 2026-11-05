import { GummyBear, PeachRing, candyColours as k } from "./Candies";
import { Container } from "./ui";

// Shared frame for the log-in and sign-up pages: friendly heading beside
// Clerk's form, which stacks underneath on phones.
export function AuthPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
      <div className="relative">
        <h1 className="text-[clamp(2.6rem,9vw,4.5rem)]">{title}</h1>
        <p className="mt-4 max-w-md text-lg font-medium text-ink-soft">{intro}</p>
        <GummyBear c={k.pink} aria-hidden className="mt-8 hidden w-20 -rotate-12 lg:block" />
        <PeachRing aria-hidden className="absolute right-6 bottom-0 hidden w-24 rotate-12 lg:block" />
      </div>
      <div className="flex justify-center lg:justify-end">{children}</div>
    </Container>
  );
}
