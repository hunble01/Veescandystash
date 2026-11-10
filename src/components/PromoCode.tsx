"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { checkDiscountCode } from "@/app/(shop)/checkout/actions";
import { saveCode } from "@/lib/cart";

// Promo code box for the bag and checkout (Vee, 2026-11-09): customers type a
// code (e.g. WELCOME10) and tap Apply to see if it works. The code is kept for
// this visit (saveCode) and checked again on the server when they order.
export function PromoCode({
  initialCode,
  onChange,
}: {
  initialCode: string;
  /** Called with the applied code and its percent, or ("", 0) when removed. */
  onChange?: (code: string, percent: number) => void;
}) {
  const id = useId();
  const [typed, setTyped] = useState(initialCode);
  const [applied, setApplied] = useState<{ code: string; percent: number } | null>(null);
  const [error, setError] = useState("");
  const [checking, startChecking] = useTransition();

  function apply(code: string) {
    const c = code.trim().toUpperCase();
    startChecking(async () => {
      const r = await checkDiscountCode(c);
      if (r.ok) {
        setError("");
        setApplied({ code: c, percent: r.percent });
        saveCode(c);
        onChange?.(c, r.percent);
      } else {
        setApplied(null);
        setError(r.message);
        saveCode("");
        onChange?.("", 0);
      }
    });
  }

  function remove() {
    setApplied(null);
    setTyped("");
    setError("");
    saveCode("");
    onChange?.("", 0);
  }

  // A code typed earlier this visit (e.g. in the bag) is checked straight away.
  useEffect(() => {
    if (initialCode) apply(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  if (applied) {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border-[3px] border-ink bg-white px-4 py-3">
        <p className="font-bold">
          🎉 <span className="uppercase">{applied.code}</span> applied: {applied.percent}% off
        </p>
        <button type="button" onClick={remove} className="text-sm font-bold text-pink-deep underline underline-offset-4">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <label htmlFor={id} className="text-sm font-extrabold">Have a promo code?</label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (typed.trim()) apply(typed);
            }
          }}
          placeholder="e.g. WELCOME10"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={40}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="block min-h-11 w-full min-w-0 rounded-full border-[3px] border-ink/80 bg-white px-4 font-bold uppercase placeholder:font-medium placeholder:normal-case"
        />
        <button
          type="button"
          onClick={() => apply(typed)}
          disabled={checking || !typed.trim()}
          className="min-h-11 shrink-0 rounded-full border-[3px] border-ink bg-teal-deep px-5 font-extrabold text-white shadow-[2px_2px_0_var(--color-ink)] disabled:opacity-50"
        >
          {checking ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-pink-deep">
          {error}
        </p>
      )}
    </div>
  );
}
