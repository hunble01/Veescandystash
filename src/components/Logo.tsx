import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

// Shows the owner's supplied logo once `site.logo` is set. Until then it is a
// plainly labelled placeholder: we never draw or recreate the logo.
export function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`${site.name} home`}>
      {site.logo ? (
        <Image src={site.logo.src} width={site.logo.width} height={site.logo.height} alt={site.name} priority className="relative -my-3 h-[84px] w-auto drop-shadow-[2px_3px_0_rgba(43,29,32,0.35)] sm:h-[92px]" />
      ) : (
        <span className="flex flex-col rounded-2xl border-2 border-dashed border-ink/40 px-3 py-0.5 leading-tight">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-ink-soft uppercase">Logo here</span>
          <span className="text-sm font-extrabold">{site.name}</span>
        </span>
      )}
    </Link>
  );
}
