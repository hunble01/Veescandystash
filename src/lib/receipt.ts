// Price breakdown lines for customer emails (Vee, 2026-11-12: proper receipts).
// Plain module: used by checkout and the payment-received email.

const cad = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

export function receiptTotals(o: {
  subtotalCents: number;
  discountCents: number;
  code?: string;
  deliveryCents: number;
  /** "Shipping", "Express pickup" or "Pickup". */
  deliveryLabel: string;
  totalCents: number;
}): [string, string][] {
  return [
    ["Subtotal", cad(o.subtotalCents)],
    ...(o.discountCents ? ([[`Discount${o.code ? ` (${o.code})` : ""}`, `−${cad(o.discountCents)}`]] as [string, string][]) : []),
    [o.deliveryLabel, o.deliveryCents ? cad(o.deliveryCents) : "Free"],
    ["Total", cad(o.totalCents)],
  ];
}
