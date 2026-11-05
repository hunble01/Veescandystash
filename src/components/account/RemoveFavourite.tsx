"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleFavourite } from "@/app/(shop)/account/actions";
import { Icon } from "./parts";

export function RemoveFavourite({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  return (
    <button
      type="button"
      disabled={busy}
      aria-label={`Remove ${name} from favourites`}
      onClick={() =>
        start(async () => {
          await toggleFavourite(productId, false);
          router.refresh();
        })
      }
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-ink/20 bg-white px-4 text-sm font-bold text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-50"
    >
      <Icon name="trash" className="h-4 w-4" /> {busy ? "Removing…" : "Remove"}
    </button>
  );
}
