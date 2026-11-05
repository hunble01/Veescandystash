import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Customer } from "@/lib/account";
import { Container } from "../ui";
import { AccountNav, AccountNavFallback } from "./AccountNav";
import { Icon, panel } from "./parts";

// Frame for every /account page: who's logged in, the account menu, help and
// log out on the left (top on phones), the page itself on the right.
export function AccountShell({ customer, children }: { customer: Customer; children: ReactNode }) {
  return (
    <Container className="grid grid-cols-[minmax(0,1fr)] gap-6 py-8 sm:py-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
      <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start print:hidden">
        <ProfileCard customer={customer} />
        <Suspense fallback={<AccountNavFallback />}>
          <AccountNav />
        </Suspense>
        <div className="hidden space-y-5 lg:block">
          <HelpCard />
          <LogOut />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
      <div className="space-y-4 lg:hidden print:hidden">
        <HelpCard />
        <LogOut />
      </div>
    </Container>
  );
}

export function Avatar({ customer, size = "h-14 w-14 text-2xl" }: { customer: Customer; size?: string }) {
  const initial = (customer.firstName || customer.name || customer.email || "?").trim().charAt(0).toUpperCase();
  return customer.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted avatar, already sized
    <img src={customer.imageUrl} alt="" className={`${size} shrink-0 rounded-full border-[3px] border-ink object-cover`} />
  ) : (
    <span aria-hidden className={`${size} grid shrink-0 place-items-center rounded-full border-[3px] border-ink bg-pink font-retro text-ink`}>
      {initial}
    </span>
  );
}

function ProfileCard({ customer }: { customer: Customer }) {
  const since = new Date(customer.memberSince).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
  return (
    <div className={`${panel} flex items-center gap-4 p-4`}>
      <Avatar customer={customer} />
      <div className="min-w-0">
        <p className="truncate font-extrabold">{customer.name || "Welcome!"}</p>
        <p className="truncate text-sm text-ink-soft">{customer.email}</p>
        <p className="mt-0.5 text-xs font-bold text-teal-deep">Member since {since}</p>
      </div>
    </div>
  );
}

function HelpCard() {
  const { email, phone } = site.contact;
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-ink/15 bg-teal-soft p-5">
      <p className="flex items-center gap-2 font-extrabold">
        <Icon name="help" /> Need a hand?
      </p>
      <p className="mt-1 text-sm text-ink-soft">Questions about an order or a custom request? Vee’s happy to help.</p>
      <ul className="mt-3 space-y-1.5 text-sm font-bold">
        {email && (
          <li>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-teal-deep hover:underline">
              <Icon name="mail" className="h-4 w-4" /> {email}
            </a>
          </li>
        )}
        {phone && (
          <li>
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-teal-deep hover:underline">
              <Icon name="phone" className="h-4 w-4" /> {phone}
            </a>
          </li>
        )}
        <li>
          <Link href="/faq" className="inline-flex items-center gap-2 text-teal-deep hover:underline">
            <Icon name="help" className="h-4 w-4" /> Read the FAQ
          </Link>
        </li>
      </ul>
    </div>
  );
}

function LogOut() {
  return (
    <SignOutButton redirectUrl="/">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-5 font-bold transition hover:bg-pink-soft"
      >
        <Icon name="logout" /> Log out
      </button>
    </SignOutButton>
  );
}
