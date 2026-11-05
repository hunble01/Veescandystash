import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

// Shows the owner's supplied logo once `site.logo` is set. Until then it is a
// plainly labelled placeholder: we never draw or recreate the logo.
export function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`${site.name} home`}>
      {site.logo ? (
        <Image src={site.logo.src} width={site.logo.width} height={site.logo.height} alt={site.name} priority className="h-14 w-auto" />
      ) : (
        <span className="flex flex-col rounded-2xl border-2 border-dashed border-ink/40 px-3 py-0.5 leading-tight">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-ink-soft uppercase">Logo here</span>
          <span className="text-sm font-extrabold">{site.name}</span>
        </span>
      )}
    </Link>
  );
}
