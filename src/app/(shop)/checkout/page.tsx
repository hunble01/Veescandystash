import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./CheckoutForm";
import { site } from "@/config/site";
import { Container, PageHeader } from "@/components/ui";
import { checkoutBlockers } from "@/lib/readiness";

export const metadata: Metadata = { title: "Place your order", robots: { index: false } };

// e-Transfer / cash checkout (Vee, 2026-11-08). With Stripe switched on, the
// cart goes straight to Stripe instead and this page isn't used.
export default function CheckoutPage() {
  if (site.payments.mode !== "manual" || checkoutBlockers().length) redirect("/cart");
  const f = site.fulfilment;
  return (
    <>
      <PageHeader eyebrow="Almost done" title="Place your order." intro="No card needed: pay by e-Transfer, or cash when you pick up." />
      <Container className="pb-20">
        <CheckoutForm
          pickup={f.methods.includes("pickup") ? f.pickupArea ?? "Vaughan" : null}
          zones={f.methods.includes("delivery") ? f.deliveryZones.map((z) => ({ ...z })) : []}
          freeDeliveryOverCents={f.freeDeliveryOverCents}
          cash={site.payments.cash}
          contactEmail={site.contact.email}
        />
      </Container>
    </>
  );
}
