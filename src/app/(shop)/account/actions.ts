"use server";

import { randomUUID } from "node:crypto";
import {
  type Address,
  MAX_ADDRESSES,
  currentUserId,
  getAddresses,
  getCustomer,
  getFavouriteIds,
  getOrder,
  setAddresses,
  setFavourite,
} from "@/lib/account";
import { getCandies, getProducts } from "@/lib/catalog";
import type { CartLine } from "@/lib/cart";

// ---------- Favourites ----------
// Signed-out callers get null, which the heart button treats as "show a log-in link".

export async function loadFavourites(): Promise<string[] | null> {
  const uid = await currentUserId();
  return uid ? getFavouriteIds(uid) : null;
}

export async function toggleFavourite(productId: string, on: boolean): Promise<string[] | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  if (!(await getProducts()).some((p) => p.id === productId)) return getFavouriteIds(uid);
  await setFavourite(uid, productId, on);
  return getFavouriteIds(uid);
}

// ---------- Order again ----------
// Rebuilds cart lines from a past order using today's catalogue and prices.
// Anything no longer sold (or sold out, or without a price) is skipped and named.

export type ReorderResult = { lines: (Omit<CartLine, "id" | "qty"> & { qty: number })[]; skipped: string[] };

export async function reorder(orderNumber: string): Promise<ReorderResult> {
  const customer = await getCustomer();
  const order = customer ? await getOrder(customer, orderNumber) : null;
  if (!order) return { lines: [], skipped: [] };

  const [products, candies] = await Promise.all([getProducts(), getCandies()]);
  const result: ReorderResult = { lines: [], skipped: [] };

  for (const item of order.items ?? []) {
    const product = products.find((p) => p.id === item.productId);
    const size = product?.sizes.find((s) => s.id === item.sizeId && s.active);
    if (!product || !size || size.priceCents == null || product.stockStatus === "sold_out") {
      result.skipped.push(item.name);
      continue;
    }
    let unitPriceCents = size.priceCents;
    let picked: { id: string; name: string }[] | undefined;
    if (product.type === "builder") {
      const found = (item.candyIds ?? []).map((id) => candies.find((c) => c.id === id));
      if (found.length === 0 || found.some((c) => !c || c.inStock === false)) {
        result.skipped.push(item.name);
        continue;
      }
      picked = found.map((c) => ({ id: c!.id, name: c!.name }));
      unitPriceCents += found.reduce((n, c) => n + (c!.extraChargeCents ?? 0), 0);
    }
    result.lines.push({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPriceCents,
      ...(picked ? { candies: picked } : {}),
      accent: product.accent,
      qty: item.quantity,
    });
  }
  return result;
}

// ---------- Address book ----------

export type AddressState = {
  status: "idle" | "saved" | "invalid" | "error";
  message?: string;
  errors?: Partial<Record<keyof Address, string>>;
  addresses?: Address[];
};

const field = (f: FormData, k: string, max = 120) => String(f.get(k) ?? "").trim().slice(0, max);

export async function saveAddress(_prev: AddressState, form: FormData): Promise<AddressState> {
  const uid = await currentUserId();
  if (!uid) return { status: "error", message: "Please log in again." };

  const a: Address = {
    _key: field(form, "_key", 40) || randomUUID().slice(0, 12),
    label: field(form, "label", 40),
    name: field(form, "name"),
    phone: field(form, "phone", 30),
    line1: field(form, "line1"),
    line2: field(form, "line2"),
    city: field(form, "city", 80),
    region: field(form, "region", 80),
    postalCode: field(form, "postalCode", 20).toUpperCase(),
    country: field(form, "country", 60) || "Canada",
    isDefault: form.get("isDefault") === "on",
  };

  const errors: AddressState["errors"] = {};
  if (!a.name) errors.name = "Please enter the name for this address.";
  if (!a.line1) errors.line1 = "Please enter the street address.";
  if (!a.city) errors.city = "Please enter the city or town.";
  if (!a.region) errors.region = "Please enter the province or state.";
  if (!a.postalCode) errors.postalCode = "Please enter the postal code.";
  else if (/^canada$/i.test(a.country) && !/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/.test(a.postalCode))
    errors.postalCode = "Canadian postal codes look like A1A 1A1.";
  else if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(a.postalCode)) a.postalCode = `${a.postalCode.slice(0, 3)} ${a.postalCode.slice(3)}`;
  if (a.phone && !/^[\d\s()+.-]{7,}$/.test(a.phone)) errors.phone = "Please check the phone number.";
  if (Object.keys(errors).length) return { status: "invalid", errors };

  try {
    const current = await getAddresses(uid);
    const exists = current.some((x) => x._key === a._key);
    if (!exists && current.length >= MAX_ADDRESSES) return { status: "error", message: `You can save up to ${MAX_ADDRESSES} addresses.` };
    let next = exists ? current.map((x) => (x._key === a._key ? a : x)) : [...current, a];
    if (a.isDefault) next = next.map((x) => ({ ...x, isDefault: x._key === a._key }));
    return { status: "saved", message: "Address saved.", addresses: await setAddresses(uid, next) };
  } catch {
    return { status: "error", message: "Sorry, we couldn’t save that. Please try again." };
  }
}

export async function deleteAddress(key: string): Promise<Address[] | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  return setAddresses(uid, (await getAddresses(uid)).filter((a) => a._key !== key));
}

export async function makeDefaultAddress(key: string): Promise<Address[] | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  return setAddresses(uid, (await getAddresses(uid)).map((a) => ({ ...a, isDefault: a._key === key })));
}
