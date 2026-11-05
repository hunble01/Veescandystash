import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { writeClient } from "@/sanity/client";

// Customer accounts. Clerk handles logins; orders and requests already live in
// Sanity, so an account just looks them up by the customer's user id or a
// verified email (orders placed as a guest with the same email show up too).
// Server-only: uses the Sanity write token to read private inbox documents.

export type Customer = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  emails: string[];
  imageUrl: string;
  memberSince: string; // ISO date
};

// cache(): the layout and the page both ask, but Clerk is called once per request.
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const user = await currentUser();
  if (!user) return null;
  const emails = user.emailAddresses.filter((e) => e.verification?.status === "verified").map((e) => e.emailAddress.toLowerCase());
  return {
    id: user.id,
    name: user.fullName ?? user.firstName ?? "",
    firstName: user.firstName ?? "",
    email: user.primaryEmailAddress?.emailAddress ?? emails[0] ?? "",
    emails,
    imageUrl: user.hasImage ? user.imageUrl : "",
    memberSince: new Date(user.createdAt).toISOString(),
  };
});

export const currentUserId = async () => (await auth()).userId;

// ---------- Orders ----------

export type OrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productId?: string;
  sizeId?: string;
  candyIds?: string[];
};

export type AccountOrder = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  fulfilment: string;
  shippingAddress: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
};

const mine = "(customerUserId == $uid || lower(customer.email) in $emails)";
const orderFields = `_id, orderNumber, createdAt, status, total, subtotal, tax, fulfilment, shippingAddress, customer,
  "items": items[]{ name, quantity, unitPrice, lineTotal, productId, sizeId, candyIds }`;

export async function getOrders(c: Customer): Promise<AccountOrder[]> {
  if (!writeClient) return [];
  return writeClient.fetch(`*[_type == "order" && ${mine}] | order(createdAt desc)[0...100]{ ${orderFields} }`, {
    uid: c.id,
    emails: c.emails,
  });
}

// Only ever returns the customer's own order, so guessing a number shows nothing.
export async function getOrder(c: Customer, orderNumber: string): Promise<AccountOrder | null> {
  if (!writeClient) return null;
  return writeClient.fetch(`*[_type == "order" && orderNumber == $n && ${mine}][0]{ ${orderFields} }`, {
    n: orderNumber,
    uid: c.id,
    emails: c.emails,
  });
}

// ---------- Custom requests ----------

export type AccountRequest = {
  _id: string;
  createdAt: string;
  status: string;
  source: string;
  occasion: string;
  eventDate: string;
  quantity: number;
  size?: string;
  theme?: string;
  mix?: string;
  allergens?: string;
  label?: string;
  packaging?: string;
  budget?: string;
  fulfilment?: string;
  area?: string;
  notes?: string;
  name?: string;
  email?: string;
  phone?: string;
  photoCount: number;
};

const mineRequest = "(userId == $uid || lower(email) in $emails)";
const requestFields = `_id, createdAt, status, source, occasion, eventDate, quantity, size, theme, mix, allergens, label,
  packaging, budget, fulfilment, area, notes, name, email, phone, "photoCount": count(photos)`;

export async function getRequests(c: Customer): Promise<AccountRequest[]> {
  if (!writeClient) return [];
  return writeClient.fetch(`*[_type == "customEnquiry" && ${mineRequest}] | order(createdAt desc)[0...100]{ ${requestFields} }`, {
    uid: c.id,
    emails: c.emails,
  });
}

export async function getRequest(c: Customer, id: string): Promise<AccountRequest | null> {
  if (!writeClient) return null;
  return writeClient.fetch(`*[_type == "customEnquiry" && _id == $id && ${mineRequest}][0]{ ${requestFields} }`, {
    id,
    uid: c.id,
    emails: c.emails,
  });
}

// ---------- Favourites: one private document per customer holding product ids ----------

const favouritesId = (uid: string) => `favourites.${uid}`;

export async function getFavouriteIds(uid: string): Promise<string[]> {
  if (!writeClient) return [];
  const doc = await writeClient.getDocument<{ productIds?: string[] }>(favouritesId(uid));
  return doc?.productIds ?? [];
}

export async function setFavourite(uid: string, productId: string, on: boolean) {
  if (!writeClient) return;
  const ids = (await getFavouriteIds(uid)).filter((id) => id !== productId);
  if (on) ids.unshift(productId);
  await writeClient.createOrReplace({ _id: favouritesId(uid), _type: "customerFavourites", userId: uid, productIds: ids });
}

// ---------- Address book: one private document per customer ----------

export type Address = {
  _key: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export const MAX_ADDRESSES = 10;
const addressesId = (uid: string) => `addresses.${uid}`;

export async function getAddresses(uid: string): Promise<Address[]> {
  if (!writeClient) return [];
  const doc = await writeClient.getDocument<{ addresses?: Address[] }>(addressesId(uid));
  return doc?.addresses ?? [];
}

export async function setAddresses(uid: string, addresses: Address[]) {
  if (!writeClient) throw new Error("Saving is not connected yet.");
  // Exactly one default whenever there are addresses.
  const list = addresses.slice(0, MAX_ADDRESSES);
  if (list.length && !list.some((a) => a.isDefault)) list[0] = { ...list[0], isDefault: true };
  await writeClient.createOrReplace({
    _id: addressesId(uid),
    _type: "customerAddresses",
    userId: uid,
    addresses: list.map((a) => ({ ...a, _type: "savedAddress" })),
  });
  return list;
}

// Everything we hold for a customer, for the "Download my data" button.
export async function exportCustomerData(c: Customer) {
  const [orders, requests, favourites, addresses] = await Promise.all([
    getOrders(c),
    getRequests(c),
    getFavouriteIds(c.id),
    getAddresses(c.id),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    account: { name: c.name, email: c.email, verifiedEmails: c.emails, memberSince: c.memberSince },
    orders,
    customRequests: requests,
    favouriteProductIds: favourites,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop the internal key
    addresses: addresses.map(({ _key, ...a }) => a),
  };
}
