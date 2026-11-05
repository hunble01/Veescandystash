import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon, PageTitle, Panel } from "@/components/account/parts";

export const metadata: Metadata = { title: "Profile & security", robots: { index: false } };

// Clerk's ready-made profile manager: name, photo, email addresses, password,
// connected Google account, signed-in devices and deleting the account.
export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageTitle title="Profile & security" intro="Update your name and photo, manage your email addresses and password, and see where you’re logged in." />

      {/* Clerk reads the page address, which is only known at request time. */}
      <Suspense fallback={<div className="h-[34rem] animate-pulse rounded-[var(--radius-card)] bg-white/70" aria-hidden />}>
        <UserProfile
          path="/account/profile"
          appearance={{
            elements: {
              rootBox: "w-full! max-w-full!",
              cardBox: "w-full! max-w-full! rounded-[1.75rem] border-[3px] border-[#2b1d17] shadow-[4px_5px_0_#2b1d17]",
            },
          }}
        />
      </Suspense>

      <Panel title="Your data & privacy">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-ink-soft">
            Download a copy of everything your account holds: your profile, orders, custom requests, favourites and saved addresses.
            To close your account, use <strong className="text-ink">Security → Delete account</strong> above.
          </p>
          <a
            href="/api/account/export"
            download
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-ink bg-white px-5 font-extrabold transition hover:-translate-y-0.5 hover:bg-teal-soft"
          >
            <Icon name="download" /> Download my data
          </a>
        </div>
      </Panel>
    </div>
  );
}
