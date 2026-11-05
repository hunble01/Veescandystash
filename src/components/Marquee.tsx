import { Fragment } from "react";
import { Sparkle } from "./Candies";

// Endless ticker ribbon. Content is duplicated so the -50% loop is seamless.
export function Marquee({
  items,
  className = "",
  reverse = false,
  star = "#fff6ea",
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
  star?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t) => (
        <Fragment key={t}>
          <span className="px-5 font-display text-2xl whitespace-nowrap sm:text-3xl">{t}</span>
          <Sparkle c={star} className="w-5 shrink-0 sm:w-6" />
        </Fragment>
      ))}
    </div>
  );
  return (
    <div aria-hidden className={`overflow-hidden border-y-[3px] border-ink py-3 ${className}`}>
      <div className={`flex w-max animate-marquee ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
