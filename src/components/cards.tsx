import Link from "next/link";
import type { CSSProperties } from "react";
import { GummyBear, JellyBean, Lollipop, PeachRing, SourBelt, WrappedCandy, candyColours as k } from "./Candies";
import { accentClasses, collectionStatusLabel, darkAccents, flavourLabel, priceFrom, stockLabel } from "@/lib/format";
import type { Occasion, Product, SeasonalCollection } from "@/lib/types";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { Pill } from "./ui";

export function productHref(p: Product) {
  return p.type === "builder" ? "/build-your-stash" : `/shop/${p.slug}`;
}

// Decorative candies peeking out of each bag, picked by flavour.
function BagCandies({ flavour }: { flavour: Product["flavour"] }) {
  const set = {
    sour: [<SourBelt key="a" c={k.teal} />, <SourBelt key="b" c={k.orange} />, <JellyBean key="c" c={k.teal} />],
    sweet: [<GummyBear key="a" c={k.pink} />, <GummyBear key="b" c={k.orange} />, <JellyBean key="c" c={k.pink} />],
    sweet_sour: [<PeachRing key="a" />, <GummyBear key="b" c={k.teal} />, <SourBelt key="c" c={k.pink} />],
    your_pick: [<WrappedCandy key="a" c={k.pink} />, <PeachRing key="b" c={k.teal} c2={k.orange} />, <GummyBear key="c" c={k.orange} />],
  }[flavour];
  const spots = [
    "top-[14%] left-[10%] w-[34%] -rotate-12 group-hover:-translate-y-3 group-hover:-rotate-20",
    "top-[22%] right-[8%] w-[30%] rotate-12 group-hover:-translate-y-4 group-hover:rotate-24",
    "bottom-[22%] left-[34%] w-[30%] rotate-6 group-hover:-translate-y-2 group-hover:-rotate-6",
  ];
  return (
    <>
      {set.map((el, i) => (
        <div key={i} className={`absolute transition-transform duration-500 ease-[cubic-bezier(.3,1.6,.5,1)] ${spots[i]}`}>
          {el}
        </div>
      ))}
    </>
  );
}

export function ProductCard({ product, style }: { product: Product; style?: CSSProperties }) {
  const a = accentClasses[product.accent];
  const stock = stockLabel[product.stockStatus];
  return (
    <Link
      href={productHref(product)}
      data-reveal
      style={style}
      className="group relative block transition-transform duration-300 hover:-translate-y-2 hover:-rotate-1"
    >
      {/* Crimped seal + coloured header strip: reads as a sealed candy bag. */}
      <div className="crimp mx-[3px]" style={{ "--c": a.dot } as CSSProperties} />
      <div className="overflow-hidden rounded-b-[var(--radius-card)] border-[3px] border-t-0 border-ink bg-white shadow-[var(--shadow-pop-lg)]">
        <div className={`h-6 ${a.solid}`} />
        <div className="p-3">
          <PhotoPlaceholder accent={product.accent} className="aspect-[5/4]">
            <BagCandies flavour={product.flavour} />
          </PhotoPlaceholder>
        </div>
        <div className="px-5 pb-5">
          {stock && <Pill className="mb-2 bg-cream">{stock}</Pill>}
          <h3 className="text-2xl">{product.name}</h3>
          <p className="mt-1 font-medium text-ink-soft">{product.summary}</p>
          <div className="mt-5 flex flex-col gap-3">
            <span className="text-sm font-bold text-ink-soft">{priceFrom(product)}</span>
            <span className="inline-flex items-center justify-center gap-1 rounded-full border-2 border-ink bg-orange px-4 py-2.5 text-sm font-extrabold transition group-hover:bg-pink">
              {product.type === "builder" ? "Start building" : "Choose options"}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </div>

      {/* Flavour sticker slapped on the bag */}
      <span className="absolute top-8 -right-2 flex h-20 w-20 rotate-12 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-center text-sm leading-tight font-extrabold shadow-[var(--shadow-pop)] transition-transform duration-300 group-hover:rotate-[24deg] group-hover:scale-110">
        <span className={a.deep}>{flavourLabel[product.flavour]}</span>
      </span>
    </Link>
  );
}

const tilts = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-3", "-rotate-3", "rotate-1"];

export function OccasionTile({ occasion, index = 0 }: { occasion: Occasion; index?: number }) {
  const a = accentClasses[occasion.accent];
  return (
    <Link
      href={`/occasions/${occasion.slug}`}
      data-reveal
      // The scroll-reveal script may mark it shown before React hydrates it.
      suppressHydrationWarning
      style={{ "--delay": `${index * 70}ms` } as CSSProperties}
      className={`group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink p-5 shadow-[var(--shadow-pop)] transition-all duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.04] hover:shadow-[var(--shadow-pop-lg)] sm:min-h-56 ${a.soft} ${tilts[index % tilts.length]}`}
    >
      <span
        aria-hidden
        className={`absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-150 ${a.solid}`}
      />
      <h3 className="relative font-display text-[1.7rem] leading-none font-normal sm:text-3xl">{occasion.shortName}</h3>
      <div className="relative">
        <p className="text-sm font-semibold text-ink-soft">{occasion.tagline}</p>
        <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-lg transition-transform group-hover:translate-x-1 group-hover:-rotate-12">
          →
        </span>
      </div>
      {/* Peeling sticker corner */}
      <span
        aria-hidden
        className="absolute right-0 bottom-0 h-8 w-8 rounded-tl-xl border-t-[3px] border-l-[3px] border-ink bg-white transition-all duration-300 group-hover:h-12 group-hover:w-12"
        style={{ background: "linear-gradient(135deg, #fff 50%, var(--color-cream) 50%)" }}
      />
    </Link>
  );
}

// Each holiday card gets its own little candy so the row feels like a drop.
const holidayCandies = [
  <Lollipop key="l" c={k.cream} c2={k.pink} />,
  <WrappedCandy key="w" c={k.cream} c2={k.orange} />,
  <GummyBear key="g" c={k.cream} />,
  <JellyBean key="j" c={k.cream} />,
];

// Bold, solid-colour holiday card built to stand out on the seasonal band.
export function SeasonalCard({ collection, index = 0 }: { collection: SeasonalCollection; index?: number }) {
  const a = accentClasses[collection.accent];
  const text = darkAccents.includes(collection.accent) ? "text-white" : "text-ink";
  return (
    <Link
      href={`/holidays/${collection.slug}`}
      data-reveal
      // The scroll-reveal script may mark it shown before React hydrates it.
      suppressHydrationWarning
      style={{ "--delay": `${index * 90}ms` } as CSSProperties}
      className={`group relative flex h-full min-h-80 flex-col overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink p-6 ${text} shadow-[var(--shadow-pop-lg)] transition-all duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.03] ${a.solid} ${tilts[index % tilts.length]}`}
    >
      <span aria-hidden className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-white/25 transition-transform duration-500 group-hover:scale-125" />
      <div aria-hidden className="absolute right-4 bottom-4 w-16 rotate-12 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[24deg]">
        {holidayCandies[index % holidayCandies.length]}
      </div>

      <span className="mb-4 self-start -rotate-3 rounded-full border-[3px] border-ink bg-cream px-3 text-ink py-1 text-xs font-extrabold tracking-wide uppercase shadow-[3px_3px_0_var(--color-ink)]">
        {collectionStatusLabel[collection.status]}
      </span>
      <h3 className="relative font-display text-4xl leading-none font-normal">{collection.name}</h3>
      <p className="relative mt-3 font-semibold">{collection.description}</p>
      {collection.ideas.length > 0 && (
        <ul className="relative mt-4 mr-16 flex flex-wrap gap-2">
          {collection.ideas.map((idea) => (
            <li key={idea} className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-ink">{idea}</li>
          ))}
        </ul>
      )}
      <p className="relative mt-auto pt-4 font-extrabold">
        {collection.orderCutoff ? `Order by ${collection.orderCutoff} · ` : ""}See themes <span aria-hidden>→</span>
      </p>
    </Link>
  );
}
