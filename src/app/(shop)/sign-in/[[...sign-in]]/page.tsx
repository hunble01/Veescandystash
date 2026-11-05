import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

// Clerk's ready-made login box, including "Continue with Google".
export default function SignInPage() {
  return (
    <AuthPage title="Welcome back." intro="Log in to see your orders, requests and saved favourites.">
      {/* Clerk reads the page address, which is only known at request time. */}
      <Suspense fallback={<div className="h-[28rem] w-full max-w-[25rem] rounded-[1rem] bg-white/70" aria-hidden />}>
        <SignIn fallbackRedirectUrl="/account" />
      </Suspense>
    </AuthPage>
  );
}
