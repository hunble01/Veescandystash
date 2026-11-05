import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Container } from "@/components/ui";
import { getCustomer } from "@/lib/account";

// Every /account page shares this frame. The login check itself happens in
// src/proxy.ts; this is a second guard and loads who's logged in.
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}

async function Frame({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  if (!customer) redirect("/sign-in");
  return <AccountShell customer={customer}>{children}</AccountShell>;
}

function AccountSkeleton() {
  return (
    <Container className="grid grid-cols-[minmax(0,1fr)] gap-6 py-8 sm:py-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
      <div aria-busy className="h-24 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
      <div className="space-y-4">
        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
      </div>
      <p className="sr-only">Loading your account…</p>
    </Container>
  );
}
