"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Lollipop, Sparkle, candyColours as k } from "@/components/Candies";
import { ButtonLink } from "@/components/ui";

// Welcome pop-up (Vee, 2026-11-05): "create an account to get 5% off your
// first order"; the code (site.welcomeCode) is emailed after sign-up. Shown once per browser, a few seconds after a new visitor
// arrives; never to logged-in customers or on login/account/checkout pages.
const KEY = "vcs-welcome-seen";
const SKIP = ["/sign-in", "/sign-up", "/account", "/checkout"];

export function WelcomePopup({ percent }: { percent: number }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Once logged in, ask the server to email the welcome code. The server
  // only ever sends it once per account; this flag just avoids extra calls.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    const flag = `vcs-welcome-code-${userId}`;
    try {
      if (localStorage.getItem(flag)) return;
      localStorage.setItem(flag, "1");
    } catch {}
    fetch("/api/account/welcome", { method: "POST" }).catch(() => {});
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    // Preview link for Vee: any page with ?welcome-preview opens it right away.
    if (window.location.search.includes("welcome-preview")) {
      const t = setTimeout(() => setOpen(true), 300);
      return () => clearTimeout(t);
    }
    if (!isLoaded || isSignedIn || SKIP.some((p) => pathname.startsWith(p))) return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return; // storage blocked: don't risk showing it on every page
    }
    const t = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(t);
  }, [isLoaded, isSignedIn, pathname]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm animate-[pop-in_400ms_both] rounded-[var(--radius-card)] border-[3px] border-ink bg-cream px-6 pt-10 pb-7 text-center shadow-[var(--shadow-pop-lg)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-xl font-bold hover:bg-pink-soft"
        >
          ×
        </button>
        <Lollipop aria-hidden c={k.pink} className="absolute -top-8 left-5 w-14 -rotate-12" />
        <Sparkle aria-hidden c={k.teal} className="absolute top-6 right-16 w-5" />

        <p className="text-sm font-extrabold tracking-[0.18em] text-pink-deep uppercase">Welcome, sweet tooth!</p>
        <h2 id="welcome-title" className="mt-2 text-[2.6rem] leading-none text-orange text-pop">
          {percent}% off
        </h2>
        <p className="mt-1 font-display text-2xl text-pink">your first order</p>
        <p className="mx-auto mt-4 max-w-xs font-semibold text-ink-soft">
          Create a free account and we’ll email you a code for {percent}% off your first order.
        </p>
        <ButtonLink href="/sign-up" onClick={close} className="mt-6 w-full">
          Create my account
        </ButtonLink>
        <button type="button" onClick={close} className="mt-3 text-sm font-bold text-ink-soft underline underline-offset-4">
          No thanks, just looking
        </button>
      </div>
    </div>
  );
}
