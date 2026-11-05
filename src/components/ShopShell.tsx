import { Suspense, type ReactNode } from "react";
import { Footer } from "./Footer";
import { Header, HeaderFallback } from "./Header";
import { RevealObserver } from "./RevealObserver";

// Storefront chrome: header, footer, grain + dot background, scroll reveals.
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <div className="shop-shell flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <RevealObserver />
      </Suspense>
    </div>
  );
}
