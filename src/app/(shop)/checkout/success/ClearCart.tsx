"use client";

import { useEffect } from "react";
import { cart } from "@/lib/cart";

// The order is paid, so empty the browser cart.
export function ClearCart() {
  useEffect(() => cart.clear(), []);
  return null;
}
