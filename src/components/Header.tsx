"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { Logo } from "./Logo";

const mobileNav = [...nav, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }];

// The page address is only known at request time on catch-all routes such as
// /sign-in/[[...sign-in]], so ShopShell wraps <Header> in <Suspense> and shows
// <HeaderFallback> (same header, no "current page" highlight) meanwhile.
export function Header() {
  return <HeaderView pathname={usePathname()} />;
}

export function HeaderFallback() {
  return <HeaderView pathname="" />;
}

function HeaderView({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { isSignedIn } = useAuth();
  const accountLink = isSignedIn ? { href: "/account", label: "My account" } : { href: "/sign-in", label: "Log in" };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40">
      {site.announcement && (
        <p className="border-b-[3px] border-ink bg-teal px-4 py-2 text-center text-sm font-bold text-ink">
          {site.announcementHref ? (
            <Link href={site.announcementHref} className="underline-offset-4 hover:underline">
              {site.announcement} <span aria-hidden>→</span>
            </Link>
          ) : (
            site.announcement
          )}
        </p>
      )}
      <div className="px-3 pt-3 sm:px-5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-full border-[3px] border-ink bg-cream/95 pr-2 pl-3 shadow-[var(--shadow-pop)] backdrop-blur sm:pl-4">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="rounded-full px-4 py-2 font-bold transition hover:bg-pink-soft aria-[current=page]:bg-orange aria-[current=page]:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Phones get this in the menu instead, to keep the bar uncluttered. */}
            <Link
              href={accountLink.href}
              className="hidden h-11 items-center rounded-full px-4 font-bold transition hover:bg-pink-soft lg:flex"
            >
              {accountLink.label}
            </Link>
            {isSignedIn && (
              <span className="hidden lg:flex">
                <UserButton />
              </span>
            )}
            <Link
              href="/cart"
              className="relative flex h-11 items-center justify-center rounded-full border-2 border-ink bg-white px-4 font-extrabold transition hover:-rotate-3 hover:bg-pink-soft"
              aria-label={count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
            >
              Cart
              {count > 0 && (
                <span
                  key={count}
                  aria-hidden
                  className="absolute -top-2 -right-2 flex h-6 min-w-6 animate-[pop-in_300ms_both] items-center justify-center rounded-full border-2 border-ink bg-pink px-1 text-xs font-extrabold"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-orange px-4 font-extrabold lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Close" : "Menu"}
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fixed inset-0 -z-10 overflow-y-auto bg-orange pt-36 lg:hidden"
          style={{ backgroundImage: "repeating-conic-gradient(from 0deg at 50% 110%, #fde0cb55 0deg 8deg, transparent 8deg 16deg)" }}
        >
          <ul className="flex flex-col gap-1 px-6 pb-16">
            {[...mobileNav, accountLink].map((item, i) => (
              <li key={item.href} className="animate-[pop-in_500ms_both]" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-display text-[2.6rem] leading-tight text-cream transition [text-shadow:3px_4px_0_var(--color-ink)] hover:translate-x-2 aria-[current=page]:text-ink aria-[current=page]:[text-shadow:none]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
