"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./parts";

export const accountNav: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "Overview", icon: "home" },
  { href: "/account/orders", label: "Orders", icon: "bag" },
  { href: "/account/requests", label: "Custom requests", icon: "sparkle" },
  { href: "/account/favourites", label: "Favourites", icon: "heart" },
  { href: "/account/addresses", label: "Addresses", icon: "pin" },
  { href: "/account/profile", label: "Profile & security", icon: "user" },
];

// Sidebar list on large screens; a swipeable row of tabs on phones.
// ShopShell-style: wrapped in <Suspense> with <AccountNavFallback> (no highlight).
export function AccountNav() {
  return <NavList pathname={usePathname()} />;
}

export function AccountNavFallback() {
  return <NavList pathname="" />;
}

function NavList({ pathname }: { pathname: string }) {
  const active = (href: string) => (href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Account">
      <ul className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {accountNav.map((item) => {
          const on = active(item.href);
          return (
            <li key={item.href} className="shrink-0 snap-start">
              <Link
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-full border-2 px-4 font-bold whitespace-nowrap transition lg:rounded-2xl lg:py-2.5 ${
                  on
                    ? "border-ink bg-orange text-ink shadow-[2px_3px_0_var(--color-ink)]"
                    : "border-ink/15 bg-white text-ink-soft hover:border-ink hover:text-ink lg:border-transparent lg:bg-transparent lg:hover:bg-white"
                }`}
              >
                <Icon name={item.icon} className="h-[1.15rem] w-[1.15rem] shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
