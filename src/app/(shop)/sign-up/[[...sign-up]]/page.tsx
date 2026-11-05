import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthPage title="Make it your stash." intro="An account is optional: it keeps your orders, custom requests and favourites in one place.">
      {/* Clerk reads the page address, which is only known at request time. */}
      <Suspense fallback={<div className="h-[28rem] w-full max-w-[25rem] rounded-[1rem] bg-white/70" aria-hidden />}>
        <SignUp fallbackRedirectUrl="/account" />
      </Suspense>
    </AuthPage>
  );
}
