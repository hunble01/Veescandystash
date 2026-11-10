"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Lollipop, Sparkle, candyColours as k } from "@/components/Candies";
import { Button } from "@/components/ui";
import { saveCode } from "@/lib/cart";

// Grand-opening pop-up (Vee, 2026-11-09): "10% off for 1 week, no account
// needed, code WELCOME10 in the pop-up". Shown once per browser, a few
// seconds after a visitor arrives; never on login/account/checkout pages, and
// not after the offer ends. "Shop now" also saves the code so it's already
// filled in at the cart.
const KEY = "vcs-launch-seen";
const SKIP = ["/sign-in", "/sign-up", "/account", "/checkout", "/studio"];

export function WelcomePopup({ code, percent, endsAt }: { code: string; percent: number; endsAt: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Preview link for Vee: any page with ?welcome-preview opens it right away.
    if (window.location.search.includes("welcome-preview")) {
      const t = setTimeout(() => setOpen(true), 300);
      return () => clearTimeout(t);
    }
    if (Date.now() >= Date.parse(endsAt) || SKIP.some((p) => pathname.startsWith(p))) return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return; // storage blocked: don't risk showing it on every page
    }
    const t = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(t);
  }, [pathname, endsAt]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  async function copy() {
    saveCode(code);
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
    setCopied(true);
  }

  function shop() {
    saveCode(code);
    close();
    router.push("/build-your-stash"); // Vee, 2026-11-10
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

        <p className="text-sm font-extrabold tracking-[0.18em] text-pink-deep uppercase">🎉 Grand opening special</p>
        <h2 id="welcome-title" className="mt-2 text-[2.6rem] leading-none text-orange text-pop">
          {percent}% off
        </h2>
        <p className="mt-1 font-display text-2xl text-pink">for 1 week only</p>
        <p className="mx-auto mt-4 max-w-xs font-semibold text-ink-soft">Use this code at checkout. No account needed!</p>

        <button
          type="button"
          onClick={copy}
          aria-label={`Copy code ${code}`}
          className="mx-auto mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] border-dashed border-ink bg-white px-4 py-3 hover:bg-pink-soft"
        >
          <span className="font-display text-3xl tracking-wider text-ink">{code}</span>
          <span className="rounded-full bg-teal px-3 py-1 text-xs font-extrabold text-ink uppercase">{copied ? "Copied!" : "Copy"}</span>
        </button>

        <Button type="button" onClick={shop} className="mt-5 w-full">
          Shop now
        </Button>
        <button type="button" onClick={close} className="mt-3 text-sm font-bold text-ink-soft underline underline-offset-4">
          No thanks, just looking
        </button>
      </div>
    </div>
  );
}
