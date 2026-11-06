"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { BagIllustration } from "@/components/BagIllustration";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { cart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { MAX_PICKS } from "@/lib/limits";
import type { CandyOption, Product } from "@/lib/types";

const categoryLabel: Record<CandyOption["category"], string> = {
  sweet: "Sweet",
  sour: "Sour",
  chocolate: "Chocolate",
  other: "Other",
};

// Same chunky selectable-card look as the size picker on product pages.
const choiceCard =
  "relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white p-2 border-[3px] border-ink/80 transition";

const stepButton =
  "flex h-10 w-10 items-center justify-center rounded-full text-xl font-extrabold hover:bg-cream disabled:opacity-30";

function StepHeading({ n, title, hint }: { n: number; title: string; hint?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-orange-soft font-retro text-lg font-bold">{n}</span>
      <h2 className="text-3xl">{title}</h2>
      {hint && <p className="w-full pl-15 font-medium text-ink-soft sm:w-auto sm:pl-0">{hint}</p>}
    </div>
  );
}

// `round`: Vee's candy photos are cut to their round dish, so they sit
// inside the tile with a soft shadow instead of filling it.
function Photo({ src, alt, label, accent, round = false }: { src: string | null; alt: string; label: string; accent: "orange" | "pink" | "teal"; round?: boolean }) {
  return src ? (
    <div className="relative aspect-square overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-cream">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 18rem, 45vw" className={round ? "object-contain p-2 drop-shadow-[0_4px_6px_rgb(43_29_23/0.25)]" : "object-cover"} />
    </div>
  ) : (
    <PhotoPlaceholder accent={accent} className="aspect-square" label={label} />
  );
}

// Build Your Stash (brief §11): pick a bag size, then candies. Sizes, prices,
// pick limits and candies all come from the catalogue, so Vee changes them in
// the Studio, not here. Two screens: bags first, then candies for the chosen
// bag (2026-10-27). The chosen bag lives in the address (?bag=…), so any link
// to this page, like the menu, goes back to the bag screen (2026-10-29).
// Picks can repeat a candy: a 6-pick bag can be six of one candy, or three
// and three. The "Your bag" tray at the top lists them for editing before
// they go in the cart.
export function StashBuilder({ product, candies, orderingOpen }: { product: Product; candies: CandyOption[]; orderingOpen: boolean }) {
  const sizes = product.sizes.filter((s) => s.active);
  const router = useRouter();
  const pathname = usePathname();
  const bagId = useSearchParams().get("bag");
  const size = sizes.find((s) => s.id === bagId);
  const [picked, setPicked] = useState<string[]>([]); // candy ids, repeats allowed
  const [filter, setFilter] = useState<CandyOption["category"] | "all">("all");
  const [added, setAdded] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const keepPicks = useRef(false);
  const chosen = size != null;

  // Each screen swap starts at the top of the builder, not mid-page (but not
  // on first load, so the page doesn't jump past the header). Coming back to
  // the bag screen from a link starts over; "Change bag" keeps the picks.
  const wasChosen = useRef(chosen);
  useEffect(() => {
    if (wasChosen.current === chosen) return;
    wasChosen.current = chosen;
    if (!chosen && !keepPicks.current) setPicked([]);
    keepPicks.current = false;
    setAdded(0);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [chosen]);

  const limit = size?.pickAllowance ?? null;
  const max = limit ?? MAX_PICKS;
  const full = picked.length >= max;
  // Filter buttons are only All, Sweet and Sour (Vee's request, 2026-10-30).
  const categories = (["sweet", "sour"] as const).filter((cat) => candies.some((c) => c.category === cat));
  const shown = filter === "all" ? candies : candies.filter((c) => c.category === filter);
  const count = (id: string) => picked.filter((x) => x === id).length;
  // Each candy once, in the order it was first picked.
  const bag = [...new Set(picked)].map((id) => candies.find((c) => c.id === id)).filter((c) => c != null);
  const unitPriceCents =
    size?.priceCents != null ? size.priceCents + picked.reduce((n, id) => n + (candies.find((c) => c.id === id)?.extraChargeCents ?? 0), 0) : null;
  const canBuy = orderingOpen && unitPriceCents != null && picked.length > 0;
  const buyLabel = !orderingOpen || unitPriceCents == null ? "Online ordering coming soon" : picked.length === 0 ? "Pick a candy to start" : "Add to cart";
  const pickedLabel = limit != null ? `${picked.length} of ${limit} picked` : `${picked.length} picked`;

  function chooseSize(id: string) {
    const next = sizes.find((s) => s.id === id);
    // A smaller bag keeps the first picks that still fit.
    if (next?.pickAllowance != null) setPicked((p) => p.slice(0, next.pickAllowance!));
    router.push(`${pathname}?bag=${encodeURIComponent(id)}`, { scroll: false });
  }

  function changeBag() {
    keepPicks.current = true;
    router.push(pathname, { scroll: false });
  }

  // Changing the bag after adding it clears "Added!", since the cart has the old mix.
  function add(id: string) {
    setAdded(0);
    setPicked((p) => (p.length < max ? [...p, id] : p));
  }

  function removeOne(id: string) {
    setAdded(0);
    setPicked((p) => {
      const i = p.lastIndexOf(id);
      return i < 0 ? p : [...p.slice(0, i), ...p.slice(i + 1)];
    });
  }

  function addToCart() {
    if (!size || unitPriceCents == null || picked.length === 0) return;
    cart.add({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPriceCents,
      candies: picked.map((id) => ({ id, name: candies.find((c) => c.id === id)?.name ?? "Candy" })),
      accent: product.accent,
    });
    setAdded((n) => n + 1);
  }

  return (
    <div ref={topRef} className="scroll-mt-44">
      {/* Screen 1: bag size */}
      {!chosen && (
        <fieldset className="animate-[pop-in_300ms_both]">
          <legend className="contents">
            <StepHeading n={1} title="Choose your bag size" />
          </legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sizes.map((s, i) => (
              <label
                key={s.id}
                className={`${choiceCard} cursor-pointer has-checked:border-ink has-checked:bg-orange-soft has-checked:shadow-[var(--shadow-pop)] has-focus-visible:outline-3 has-focus-visible:outline-teal`}
              >
                <input type="radio" name="size" value={s.id} checked={false} onChange={() => chooseSize(s.id)} className="sr-only" />
                {s.photo ? (
                  <Photo src={s.photo} alt={`${s.label} bag`} label="" accent="orange" />
                ) : (
                  <BagIllustration scale={sizes.length > 1 ? i / (sizes.length - 1) : 1} label={s.label} />
                )}
                {/* Price beside the size (Vee, 2026-11-04). */}
                <span className="mt-3 flex flex-wrap items-baseline justify-between gap-x-2 px-2">
                  <span className="font-display text-2xl">{s.label}</span>
                  <span className="font-display text-xl text-orange">{formatPrice(s.priceCents)}</span>
                </span>
                <span className="px-2 pb-2 text-sm font-semibold text-ink-soft">
                  {s.pickAllowance != null ? `Pick up to ${s.pickAllowance} candies` : "Pick as many as you like"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Screen 2: candies for the chosen bag */}
      {size && (
        <div className="animate-[pop-in_300ms_both]">
          {/* Your bag: the picks so far, editable before adding to the cart */}
          <section aria-labelledby="your-bag" className="mb-10 rounded-[var(--radius-card)] border-[3px] border-ink bg-orange-soft p-4 shadow-[var(--shadow-pop)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="your-bag">
                  <span className="block font-sans text-sm font-extrabold tracking-wide text-ink-soft uppercase">Your bag</span>
                  <span className="text-3xl">{size.label}</span>
                </h2>
                <p className="text-sm font-semibold text-ink-soft">{formatPrice(unitPriceCents)}</p>
              </div>
              <Button type="button" variant="secondary" onClick={changeBag} className="min-h-11 px-5">
                ← Change bag
              </Button>
            </div>

            <p aria-live="polite" className="mt-3 font-bold">
              {pickedLabel}
              {limit != null && picked.length < limit && picked.length > 0 && <span className="font-semibold text-ink-soft"> · {limit - picked.length} to go</span>}
              {limit != null && full && <span className="text-pink-deep"> · Your bag is full!</span>}
            </p>
            {limit != null && (
              <div aria-hidden className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
                <div className="h-full bg-pink transition-[width]" style={{ width: `${(picked.length / limit) * 100}%` }} />
              </div>
            )}

            {bag.length === 0 ? (
              <p className="mt-4 font-medium text-ink-soft">Tap a candy below to add it. You can pick the same one more than once.</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {bag.map((c) => (
                  <li key={c.id} className="flex items-center gap-1 rounded-full border-[3px] border-ink bg-white py-0.5 pr-1 pl-4">
                    <span className="font-bold">
                      {c.name}
                      <span className="ml-1 text-pink-deep">×{count(c.id)}</span>
                    </span>
                    <button type="button" aria-label={`Remove one ${c.name}`} onClick={() => removeOne(c.id)} className={stepButton}>
                      −
                    </button>
                    <button type="button" aria-label={`Add another ${c.name}`} disabled={full} onClick={() => add(c.id)} className={stepButton}>
                      +
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" disabled={!canBuy} onClick={addToCart} className="w-full sm:w-auto">
                {buyLabel}
              </Button>
              {picked.length > 0 && (
                <button type="button" onClick={() => setPicked([])} className="text-sm font-bold text-pink-deep underline underline-offset-4">
                  Empty my bag
                </button>
              )}
              <p aria-live="polite" className="font-bold">
                {added > 0 && (
                  <span key={added} className="inline-flex animate-[pop-in_300ms_both] items-center gap-2">
                    Added to your stash!{" "}
                    <Link href="/cart" className="text-teal-deep underline decoration-2 underline-offset-4">
                      View cart →
                    </Link>
                  </span>
                )}
              </p>
            </div>
          </section>

          <StepHeading n={2} title="Pick your candies" hint="Tap to add. Tap again for more of the same." />

          {categories.length > 1 && (
            <div role="group" aria-label="Filter candies" className="mb-5 flex flex-wrap gap-2">
              {(["all", ...categories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                  className="min-h-11 rounded-full border-[3px] border-ink/80 bg-white px-4 font-bold transition aria-pressed:border-ink aria-pressed:bg-pink-soft"
                >
                  {c === "all" ? "All" : categoryLabel[c]}
                </button>
              ))}
            </div>
          )}

          {candies.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-ink/30 bg-white/80 p-6 text-center font-semibold text-ink-soft">
              Candy choices are coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((c) => {
                const soldOut = c.inStock === false;
                const n = count(c.id);
                return (
                  <div key={c.id} className={`${choiceCard} ${n > 0 ? "border-ink bg-pink-soft shadow-[var(--shadow-pop)]" : ""} ${soldOut ? "opacity-50" : ""}`}>
                    <button
                      type="button"
                      disabled={soldOut || full}
                      onClick={() => add(c.id)}
                      aria-label={soldOut ? `${c.name}, sold out` : `Add ${c.name}${n > 0 ? ` (${n} in your bag)` : ""}`}
                      className="flex flex-col text-left focus-visible:outline-3 focus-visible:outline-teal disabled:cursor-not-allowed"
                    >
                      <Photo round src={c.photo} alt="" label="Photo soon" accent={c.category === "sour" ? "teal" : "pink"} />
                      <span className="mt-3 px-2 text-lg leading-tight font-extrabold">{c.name}</span>
                      <span className="px-2 pb-2 text-sm font-semibold text-ink-soft">
                        {soldOut ? "Sold out" : categoryLabel[c.category]}
                        {!soldOut && c.extraChargeCents ? ` · +${formatPrice(c.extraChargeCents)}` : ""}
                      </span>
                    </button>
                    {n > 0 && (
                      <>
                        <span aria-hidden className="absolute top-4 right-4 flex h-9 min-w-9 items-center justify-center rounded-full border-[3px] border-ink bg-orange px-1 text-lg font-extrabold">
                          ×{n}
                        </span>
                        <div className="mx-2 mb-2 flex items-center justify-between rounded-full border-[3px] border-ink bg-white">
                          <button type="button" aria-label={`Remove one ${c.name}`} onClick={() => removeOne(c.id)} className={stepButton}>
                            −
                          </button>
                          <span className="font-extrabold">{n}</span>
                          <button type="button" aria-label={`Add another ${c.name}`} disabled={full} onClick={() => add(c.id)} className={stepButton}>
                            +
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {limit != null && full && <p className="mt-4 font-semibold text-pink-deep">That’s a full bag! Use − to swap a candy out.</p>}
        </div>
      )}

      {/* Add to cart bar: pops up once a candy is picked, so shoppers
          don't have to scroll back to the tray (Vee's request, 2026-10-29).
          Kept outside the animated screen above: an ancestor with a
          transform would pin this "fixed" bar to the page, not the screen. */}
      {size && picked.length > 0 && (
        <>
          <div aria-hidden className="h-28" />
          <div className="fixed inset-x-0 bottom-0 z-40 animate-[pop-in_300ms_both] border-t-[3px] border-ink bg-cream px-4 py-3 shadow-[0_-4px_0_rgb(0_0_0/0.08)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-extrabold whitespace-nowrap">{pickedLabel}</p>
                {added > 0 ? (
                  <Link href="/cart" className="text-sm font-bold text-teal-deep underline underline-offset-4">
                    Added! View cart →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="text-sm font-semibold text-teal-deep underline underline-offset-4"
                  >
                    See my bag ↑
                  </button>
                )}
              </div>
              <Button type="button" disabled={!canBuy} onClick={addToCart} className="shrink-0 px-5 text-sm sm:text-base">
                {canBuy && unitPriceCents != null ? `${buyLabel} · ${formatPrice(unitPriceCents)}` : buyLabel}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
