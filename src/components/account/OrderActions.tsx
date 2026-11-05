"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reorder } from "@/app/(shop)/account/actions";
import { cart } from "@/lib/cart";
import { Icon } from "./parts";

const btn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[3px] border-ink px-5 font-extrabold transition hover:-translate-y-0.5 disabled:opacity-50";

// "Order again": adds the same bags to the cart at today's prices, then opens the cart.
export function ReorderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [note, setNote] = useState("");

  const run = () =>
    start(async () => {
      setNote("");
      const { lines, skipped } = await reorder(orderNumber);
      lines.forEach(({ qty, ...line }) => cart.add(line, qty));
      if (lines.length === 0) {
        setNote("Sorry, the items in this order aren’t available to buy right now.");
        return;
      }
      if (skipped.length) setNote(`Added to your cart. Not available right now: ${skipped.join(", ")}.`);
      router.push("/cart");
    });

  return (
    <div>
      <button type="button" onClick={run} disabled={busy} className={`${btn} bg-orange shadow-[var(--shadow-pop)]`}>
        <Icon name="repeat" /> {busy ? "Adding…" : "Order again"}
      </button>
      {note && (
        <p role="status" className="mt-2 max-w-xs text-sm font-semibold text-ink-soft">
          {note}
        </p>
      )}
    </div>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${btn} bg-white`}>
      <Icon name="print" /> Print receipt
    </button>
  );
}
