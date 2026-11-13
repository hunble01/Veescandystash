"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GummyBear, candyColours as k } from "@/components/Candies";
import { PromoCode } from "@/components/PromoCode";
import { Button, ButtonLink } from "@/components/ui";
import { bagPhoto } from "@/data/bagPhotos";
import { MAX_QTY, cart, saveCode, useCart, useSavedCode } from "@/lib/cart";
import { site } from "@/config/site";
import { accentClasses, describeExtras, describePicks, formatPrice } from "@/lib/format";

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
  const [promo, setPromo] = useState({ code: "", percent: 0 });
  const code = promo.code;
  const discountCents = Math.round((subtotalCents * promo.percent) / 100);
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
              <div aria-hidden className={`relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:block ${a.soft}`}>
                {/* Build Your Stash bags show Vee's photo of that bag size (2026-11-09). */}
                {l.candies && bagPhoto(l.sizeLabel) && <Image src={bagPhoto(l.sizeLabel)!} alt="" fill sizes="80px" className="object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={l.candies ? "/build-your-stash" : `/shop/${l.productSlug}`} className="text-xl font-extrabold hover:underline">
                      {l.productName}
                    </Link>
                    <p className="font-medium text-ink-soft">{l.sizeLabel}</p>
                    {l.candies && <p className="mt-1 text-sm font-medium text-ink-soft">{describePicks(l.candies.map((c) => c.name))}</p>}
                    {l.candies && describeExtras(l.candies) && (
                      <p className="mt-1 text-sm font-bold text-pink-deep">Extra candy: {describeExtras(l.candies)}</p>
                    )}
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
          {discountCents > 0 && (
            <>
              <div className="flex justify-between">
                <dt className="font-medium">Promo {code} ({promo.percent}% off)</dt>
                <dd className="font-bold">−{formatPrice(discountCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">After discount</dt>
                <dd className="font-extrabold">{formatPrice(subtotalCents - discountCents)}</dd>
              </div>
            </>
          )}
        </dl>
        <p className="mt-3 text-sm font-medium text-ink-soft">
          {paymentMode === "manual" ? `${site.fulfilment.methods.includes("delivery") ? "Choose pickup or shipping on the next step." : `Free pickup in ${site.fulfilment.pickupArea ?? "Vaughan"}.`} Pay by e-Transfer, or cash at pickup.` : "Tax and pickup or delivery are confirmed at checkout."}
        </p>
        {/* Promo code (Vee, 2026-11-09). Checked on the server again at checkout. */}
        <PromoCode initialCode={saved} onChange={(c, percent) => setPromo({ code: c, percent })} />
        {welcomePercent && !isSignedIn ? (
          <p className="mt-3 text-sm font-bold">
            🍬 <Link href="/sign-up?redirect_url=/cart" onClick={() => saveCode(code)} className="text-pink-deep underline underline-offset-4">Create an account</Link> and we’ll email you a code for {welcomePercent}% off your first order.
          </p>
        ) : null}
        {/* Log in, sign up or continue as a guest (Vee, 2026-11-13). Login brings them back to the cart. */}
        {checkoutOpen && !isSignedIn ? (
          <div className="mt-6 space-y-3">
            <p className="font-extrabold">How would you like to order?</p>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href="/sign-in?redirect_url=/cart" variant="secondary" onClick={() => saveCode(code)} className="px-3">
                Log in
              </ButtonLink>
              <ButtonLink href="/sign-up?redirect_url=/cart" variant="secondary" onClick={() => saveCode(code)} className="px-3">
                Sign up
              </ButtonLink>
            </div>
            <Button type="button" onClick={checkout} disabled={status === "loading"} className="w-full">
              {status === "loading" ? "Opening secure checkout…" : "Continue as guest"}
            </Button>
            <p className="text-center text-xs font-medium text-ink-soft">With an account you can see your orders and save favourites.</p>
          </div>
        ) : checkoutOpen ? (
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
