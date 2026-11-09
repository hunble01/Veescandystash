import type { StructureResolver } from "sanity/structure";
import { StartHere } from "./StartHere";

// Studio menu (Vee, 2026-11-08: "make it easier to understand"): a Start here
// page, then "to do" lists in the order work happens, then everything, then
// the shop catalogue.

const newest = [{ field: "createdAt", direction: "desc" as const }];
const oldest = [{ field: "createdAt", direction: "asc" as const }];

export const structure: StructureResolver = (S) => {
  const list = (title: string, filter: string, order = oldest) =>
    S.listItem()
      .title(title)
      .child(S.documentList().title(title).filter(filter).defaultOrdering(order));

  return S.list()
    .title("Vee’s Candy Stash")
    .items([
      S.listItem().title("🏠 Start here").child(S.component(StartHere).title("Start here")),

      S.divider().title("To do"),
      list("⏳ Waiting for payment", '_type == "order" && status == "awaiting_payment"'),
      list("📦 Paid: ready to pack", '_type == "order" && status in ["new", "paid"]'),
      list("🛍️ Waiting for pickup / delivery", '_type == "order" && status in ["packed", "ready"]'),
      list("🎉 New custom requests", '_type == "customEnquiry" && (status == "new" || !defined(status))'),
      list("💌 Messages to answer", '_type == "contactMessage" && handled != true'),

      S.divider().title("Everything"),
      S.listItem().title("🧾 All orders").child(S.documentTypeList("order").title("All orders").defaultOrdering(newest)),
      S.listItem()
        .title("🎈 All custom requests")
        .child(S.documentTypeList("customEnquiry").title("All custom requests").defaultOrdering(newest)),
      S.listItem().title("✉️ All messages").child(S.documentTypeList("contactMessage").title("All messages").defaultOrdering(newest)),

      S.divider().title("🍬 My shop"),
      S.documentTypeListItem("product").title("🍬 Products & prices"),
      S.documentTypeListItem("candyOption").title("🍭 Candies (in stock?)"),
      S.documentTypeListItem("occasion").title("🎈 Occasions"),
      S.documentTypeListItem("seasonalCollection").title("🎃 Holiday collections"),
      S.documentTypeListItem("faqItem").title("❓ FAQ"),
    ]);
};
