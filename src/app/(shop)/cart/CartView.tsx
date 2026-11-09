"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GummyBear, candyColours as k } from "@/components/Candies";
import { Button, ButtonLink } from "@/components/ui";
import { MAX_QTY, cart, saveCode, useCart, useSavedCode } from "@/lib/cart";
import { accentClasses, describePicks, formatPrice } from "@/lib/format";

export function CartView({
  checkoutOpen,
  welcomePercent,
  paymentMode,
}: {
  checkoutOpen: boolean;
  welcomePercent: number | null;
  paymentMode: "manual" | "stripe";
}) {
  const { lines, count, subtotalCents } = useCart();
  const { isSignedIn } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  // A code typed earlier this visit is kept (e.g. coming back from the order page).
  const saved = useSavedCode();
  const [typed, setCode] = useState<string | null>(null);
  const code = typed ?? saved;
  const router = useRouter();

  async function checkout() {
    if (paymentMode === "manual") {
      saveCode(code);
      router.push("/checkout");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() || undefined, lines: lines.map((l) => ({ productId: l.productId, sizeId: l.sizeId, candyIds: l.candies?.map((c) => c.id), qty: l.qty })) }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? "Checkout failed");
      window.location.assign(body.url);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Checkout failed");
      setStatus("error");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <GummyBear c={k.pink} className="mx-auto w-24 -rotate-12" />
        <h2 className="mt-6 text-4xl">Your stash is empty.</h2>
        <p className="mt-3 text-lg font-medium text-ink-soft">Every sweet tooth needs one. Let’s fix that.</p>
        <ButtonLink href="/build-your-stash" className="mt-8">Build your stash</ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="space-y-4">
        {lines.map((l) => {
          const a = accentClasses[l.accent];
          return (
            <li key={l.id} className="flex gap-4 rounded-[var(--radius-card)] border-[3px] border-ink bg-white p-4 shadow-[var(--shadow-pop)] sm:p-5">
              <div aria-hidden className={`hidden h-20 w-20 shrink-0 rounded-2xl sm:block ${a.soft}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={l.candies ? "/build-your-stash" : `/shop/${l.productSlug}`} className="text-xl font-extrabold hover:underline">
                      {l.productName}
                    </Link>
                    <p className="font-medium text-ink-soft">{l.sizeLabel}</p>
                    {l.candies && <p className="mt-1 text-sm font-medium text-ink-soft">{describePicks(l.candies.map((c) => c.name))}</p>}
                  </div>
                  <p className="font-extrabold">{formatPrice(l.unitPriceCents * l.qty)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div role="group" aria-label={`Quantity of ${l.productName}`} className="flex items-center rounded-full border-[3px] border-ink/80 bg-white">
                    <button type="button" aria-label="Decrease quantity" disabled={l.qty <= 1} onClick={() => cart.setQty(l.id, l.qty - 1)} className="h-10 w-10 rounded-full text-lg hover:bg-cream disabled:opacity-30">−</button>
                    <output aria-live="polite" className="w-8 text-center font-bold">{l.qty}</output>
                    <button type="button" aria-label="Increase quantity" disabled={l.qty >= MAX_QTY} onClick={() => cart.setQty(l.id, l.qty + 1)} className="h-10 w-10 rounded-full text-lg hover:bg-cream disabled:opacity-30">+</button>
                  </div>
                  <button type="button" onClick={() => cart.remove(l.id)} className="text-sm font-bold text-pink-deep underline underline-offset-4">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="sticky top-32 rounded-[var(--radius-card)] border-[3px] border-ink bg-orange-soft p-6 shadow-[var(--shadow-pop-lg)]">
        <h2 className="text-3xl">Summary</h2>
        <dl className="mt-4 space-y-2 text-lg">
          <div className="flex justify-between">
            <dt className="font-medium">Items</dt>
            <dd className="font-bold">{count}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Subtotal</dt>
            <dd className="font-extrabold">{formatPrice(subtotalCents)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm font-medium text-ink-soft">
          {paymentMode === "manual" ? "Choose pickup or delivery on the next step. Pay by e-Transfer, or cash at pickup." : "Tax and pickup or delivery are confirmed at checkout."}
        </p>
        {/* Discount code + welcome offer reminder (Vee, 2026-11-05). The code is
            checked on the server at checkout. */}
        <label className="mt-5 block">
          <span className="text-sm font-extrabold">Discount code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. your welcome code"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={40}
            className="mt-1 block min-h-11 w-full rounded-full border-[3px] border-ink/80 bg-white px-4 font-bold uppercase placeholder:font-medium placeholder:normal-case"
          />
        </label>
        {welcomePercent && !isSignedIn ? (
          <p className="mt-3 text-sm font-bold">
            🍬 <Link href="/sign-up" className="text-pink-deep underline underline-offset-4">Create an account</Link> and we’ll email you a code for {welcomePercent}% off your first order.
          </p>
        ) : null}
        {checkoutOpen ? (
          <Button type="button" onClick={checkout} disabled={status === "loading"} className="mt-6 w-full">
            {paymentMode === "manual" ? "Continue to order" : status === "loading" ? "Opening secure checkout…" : "Checkout securely"}
          </Button>
        ) : (
          <p className="mt-6 rounded-2xl border-2 border-dashed border-ink/40 bg-white/70 p-4 text-center font-bold">Online ordering coming soon</p>
        )}
        {status === "error" && (
          <p role="alert" className="mt-4 rounded-xl bg-pink-soft px-4 py-3 text-sm font-semibold text-pink-deep">
            {message}
          </p>
        )}
      </aside>
    </div>
  );
}
