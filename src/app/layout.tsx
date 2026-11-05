import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Shrikhand } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// PLACEHOLDER fonts until brand fonts are approved (brief §17).
const shrikhand = Shrikhand({
  variable: "--font-shrikhand",
  subsets: ["latin"],
  weight: "400",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.slogan}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#fff6ea",
};

// Bare document shell. The storefront chrome lives in ShopShell so the
// embedded Sanity Studio at /studio gets a clean full-screen page.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      localization={{
        signIn: { start: { title: "Log in to Vee’s Candy Stash", subtitle: "Welcome back! Pick how you’d like to log in." } },
        signUp: { start: { title: "Create your account", subtitle: "It only takes a minute." } },
      }}
      appearance={{
        variables: {
          colorPrimary: "#f2762e",
          fontFamily: "var(--font-bricolage)",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en-CA" className={`${shrikhand.variable} ${bricolage.variable} h-full antialiased`}>
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
