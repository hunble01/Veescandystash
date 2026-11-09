import { useDocumentOperation, type DocumentActionComponent, type DocumentActionProps } from "sanity";

// One big "next step" button at the bottom of each order, request and message,
// so Vee never has to find the right radio button and then press Publish
// (Vee, 2026-11-08: "make it easier to understand").

type Step = { label: string; set: Record<string, unknown>; tone: "positive" | "primary" };

function nextStep(type: string, doc: Record<string, unknown> | null): Step | null {
  if (!doc) return null;
  if (type === "order") {
    const cash = doc.paymentMethod === "cash";
    switch (doc.status) {
      case "awaiting_payment":
        // Cash is collected at pickup, so the bag gets packed first.
        return cash
          ? { label: "📦 Mark as packed", set: { status: "packed" }, tone: "primary" }
          : { label: "💰 Payment received", set: { status: "paid" }, tone: "positive" };
      case "new":
      case "paid":
        return { label: "📦 Mark as packed", set: { status: "packed" }, tone: "primary" };
      case "packed":
        return { label: doc.fulfilment === "delivery" ? "🚗 Out for delivery" : "🛍️ Ready for pickup", set: { status: "ready" }, tone: "primary" };
      case "ready":
        return {
          label: cash ? "✅ Picked up & cash paid" : doc.fulfilment === "delivery" ? "✅ Delivered" : "✅ Picked up",
          set: { status: "done" },
          tone: "positive",
        };
      default:
        return null;
    }
  }
  if (type === "customEnquiry") {
    if (doc.status === "new" || !doc.status) return { label: "💬 I’ve replied / sent a quote", set: { status: "quoted" }, tone: "primary" };
    if (doc.status === "quoted") return { label: "✅ Booked!", set: { status: "booked" }, tone: "positive" };
    return null;
  }
  if (type === "contactMessage") {
    return doc.handled ? null : { label: "✅ Mark as replied", set: { handled: true }, tone: "positive" };
  }
  return null;
}

export const NextStepAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const doc = (props.draft ?? props.published) as Record<string, unknown> | null;
  const step = nextStep(props.type, doc);
  if (!step) return null;
  return {
    label: step.label,
    tone: step.tone,
    onHandle: () => {
      patch.execute([{ set: step.set }]);
      publish.execute();
      props.onComplete();
    },
  };
};
