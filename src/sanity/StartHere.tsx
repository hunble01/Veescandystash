import { Badge, Box, Card, Flex, Heading, Spinner, Stack, Text } from "@sanity/ui";
import { useEffect, useState } from "react";
import { useClient } from "sanity";
import { IntentLink } from "sanity/router";

// "Start here" page: the first thing Vee sees in the Studio. Shows what needs
// doing today, with each item one tap away, and a short how-to.

type Item = { _id: string; _type: string; title: string; sub: string; total?: number };
type Data = { pay: Item[]; pack: Item[]; ready: Item[]; requests: Item[]; messages: Item[] };

const QUERY = `{
  "pay": *[_type == "order" && status == "awaiting_payment"] | order(createdAt asc){ _id, _type,
    "title": customer.name, total, "sub": orderNumber + " · " + select(paymentMethod == "cash" => "cash at pickup", "e-Transfer") },
  "pack": *[_type == "order" && status in ["new", "paid"]] | order(createdAt asc){ _id, _type,
    "title": customer.name, total, "sub": orderNumber + " · " + select(fulfilment == "delivery" => "delivery", "pickup") },
  "ready": *[_type == "order" && status in ["packed", "ready"]] | order(createdAt asc){ _id, _type,
    "title": customer.name, total, "sub": orderNumber + " · " + select(status == "ready" => "waiting for pickup / delivery", "packed") },
  "requests": *[_type == "customEnquiry" && (status == "new" || !defined(status))] | order(createdAt asc){ _id, _type,
    "title": name + " · " + coalesce(occasion, "Request"), "sub": string(quantity) + " bags · needed " + coalesce(eventDate, "?") },
  "messages": *[_type == "contactMessage" && handled != true] | order(createdAt asc){ _id, _type,
    "title": name, "sub": message },
}`;

function Section({ emoji, title, help, items, tone }: { emoji: string; title: string; help: string; items: Item[]; tone: "caution" | "primary" | "positive" | "default" }) {
  return (
    <Card padding={4} radius={3} shadow={1} tone={items.length ? tone : "default"}>
      <Stack gap={3}>
        <Flex align="center" gap={2}>
          <Text size={3}>{emoji}</Text>
          <Box flex={1}>
            <Text size={2} weight="bold">{title}</Text>
          </Box>
          <Badge tone={items.length ? tone : "default"} fontSize={2} padding={2}>{items.length}</Badge>
        </Flex>
        <Text size={1} muted>{help}</Text>
        {items.length === 0 ? (
          <Text size={1} muted>Nothing here right now 🎉</Text>
        ) : (
          <Stack gap={2}>
            {items.slice(0, 8).map((it) => (
              <Card key={it._id} as={IntentLink} intent="edit" params={{ id: it._id, type: it._type }} padding={3} radius={2} border style={{ textDecoration: "none" }}>
                <Stack gap={2}>
                  <Text size={2} weight="semibold" textOverflow="ellipsis">{it.title}{it.total != null ? ` · $${it.total.toFixed(2)}` : ""}</Text>
                  <Text size={1} muted textOverflow="ellipsis">{it.sub}</Text>
                </Stack>
              </Card>
            ))}
            {items.length > 8 && <Text size={1} muted>…and {items.length - 8} more in the menu.</Text>}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export function StartHere() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      client
        .fetch<Data>(QUERY)
        .then((d) => live && setData(d))
        .catch(() => live && setFailed(true));
    load();
    // Refresh when anything in the inbox changes.
    const sub = client
      .listen(`*[_type in ["order", "customEnquiry", "contactMessage"]]`, {}, { includeResult: false, visibility: "query" })
      .subscribe(() => load());
    return () => {
      live = false;
      sub.unsubscribe();
    };
  }, [client]);

  return (
    <Box padding={4} style={{ maxWidth: 720 }}>
      <Stack gap={4}>
        <Stack gap={3}>
          <Heading size={3}>Hi Vee! 👋</Heading>
          <Text size={2} muted>Here’s what needs doing. Tap any item to open it, then press the big button at the bottom to move it to the next step.</Text>
        </Stack>

        {failed && <Card padding={3} tone="critical" radius={2}><Text>Couldn’t load your inbox. Check your internet and refresh.</Text></Card>}
        {!data && !failed && <Flex justify="center" padding={5}><Spinner /></Flex>}

        {data && (
          <>
            <Section emoji="⏳" title="Waiting for payment" tone="caution" items={data.pay}
              help="Check your bank for an e-Transfer with this order number. When it’s there, open the order and tap “💰 Payment received”." />
            <Section emoji="📦" title="Paid: ready to pack" tone="primary" items={data.pack}
              help="Pack these, then tap “📦 Mark as packed”." />
            <Section emoji="🛍️" title="Packed: waiting for pickup or delivery" tone="positive" items={data.ready}
              help="Email the customer a pickup time (or deliver it). Tap the button again when it’s ready, and once more when it’s picked up or delivered." />
            <Section emoji="🎉" title="New custom order requests" tone="primary" items={data.requests}
              help="Reply to the customer by email with a quote, then tap “💬 I’ve replied / sent a quote”." />
            <Section emoji="💌" title="Messages to answer" tone="primary" items={data.messages}
              help="Reply by email, then tap “✅ Mark as replied”." />
          </>
        )}

        <Card padding={4} radius={3} border>
          <Stack gap={3}>
            <Text size={2} weight="bold">📖 How things move</Text>
            <Text size={1}>Orders: ⏳ Waiting for payment → 💰 Paid → 📦 Packed → 🛍️ Ready → ✅ Done</Text>
            <Text size={1}>Cash orders: ⏳ Received → 📦 Packed → 🛍️ Ready → ✅ Picked up & paid</Text>
            <Text size={1}>Customers see these steps in their account, so keep them up to date.</Text>
            <Text size={1}>To change prices, photos or what’s in stock, use 🍬 My shop in the menu. Changes go live when you press Publish.</Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
