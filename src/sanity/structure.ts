import type { StructureResolver } from "sanity/structure";

// Studio sidebar: inbox first (what needs doing), then the catalogue.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Vee’s Candy Stash")
    .items([
      S.listItem()
        .title("🆕 New orders")
        .child(
          S.documentList()
            .title("New orders")
            .filter('_type == "order" && status == "new"')
            .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
        ),
      S.listItem()
        .title("🧾 All orders")
        .child(S.documentTypeList("order").title("All orders").defaultOrdering([{ field: "createdAt", direction: "desc" }])),
      S.listItem()
        .title("🎉 Custom order requests")
        .child(S.documentTypeList("customEnquiry").title("Custom order requests").defaultOrdering([{ field: "createdAt", direction: "desc" }])),
      S.listItem()
        .title("💌 Messages")
        .child(S.documentTypeList("contactMessage").title("Messages").defaultOrdering([{ field: "createdAt", direction: "desc" }])),
      S.divider(),
      S.documentTypeListItem("product").title("🍬 Products"),
      S.documentTypeListItem("candyOption").title("🍭 Candy options"),
      S.documentTypeListItem("occasion").title("🎈 Occasions"),
      S.documentTypeListItem("seasonalCollection").title("🎃 Holiday collections"),
      S.documentTypeListItem("faqItem").title("❓ FAQ"),
    ]);
