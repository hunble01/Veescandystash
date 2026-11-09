"use client";

import { useSyncExternalStore } from "react";
import { MAX_QTY } from "./limits";
import type { Accent } from "./types";

export { MAX_QTY };

// Cart lives in the shopper's browser (localStorage) and syncs across tabs.
// Names and prices here are only for display: the checkout route re-reads
// every price from the catalogue, so an edited cart can't change what's charged.

export interface CartLine {
  id: string; // `${productId}:${sizeId}`, plus the picked candy ids for builder bags
  productId: string;
  productSlug: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  unitPriceCents: number;
  candies?: { id: string; name: string }[]; // Build Your Stash picks
  qty: number;
  accent: Accent;
}

const KEY = "vcs-cart-v1";
// Discount code typed in the cart, carried to the e-Transfer/cash order page.
export const CODE_KEY = "vcs-discount-code";
const EMPTY: CartLine[] = [];

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or storage full: the cart still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n)));

export const cart = {
  add(line: Omit<CartLine, "id" | "qty">, qty = 1) {
    // Two builder bags with different candies are separate lines.
    const picks = line.candies?.map((c) => c.id).sort().join("+");
    const id = `${line.productId}:${line.sizeId}${picks ? `:${picks}` : ""}`;
    const lines = read();
    const existing = lines.find((l) => l.id === id);
    write(
      existing
        ? lines.map((l) => (l.id === id ? { ...l, ...line, qty: clampQty(l.qty + qty) } : l))
        : [...lines, { ...line, id, qty: clampQty(qty) }],
    );
  },
  setQty(id: string, qty: number) {
    write(read().map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l)));
  },
  remove(id: string) {
    write(read().filter((l) => l.id !== id));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotalCents = lines.reduce((n, l) => n + l.unitPriceCents * l.qty, 0);
  return { lines, count, subtotalCents };
}

// The code saved for the order page ("" on the server and first render).
const noop = () => () => {};
export function useSavedCode() {
  return useSyncExternalStore(
    noop,
    () => {
      try {
        return sessionStorage.getItem(CODE_KEY) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );
}

export function saveCode(code: string) {
  try {
    if (code.trim()) sessionStorage.setItem(CODE_KEY, code.trim());
    else sessionStorage.removeItem(CODE_KEY);
  } catch {
    // Private mode: the code just isn't carried over.
  }
}
