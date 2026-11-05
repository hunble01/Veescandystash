import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Lobster, Shrikhand } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// Fonts chosen to match Vee's logo (2026-11-04): Lobster is the closest
// Google font to the logo's "Candy Stash" script and is used for headings;
// Shrikhand matches the chunky retro "Vee's" and is kept for ribbons,
// numbers and badges. Bricolage Grotesque stays for easy-to-read body text.
const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: "400",
});

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
  themeColor: "#faf1e2",
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
          colorPrimary: "#e9652c",
          fontFamily: "var(--font-bricolage)",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en-CA" className={`${lobster.variable} ${shrikhand.variable} ${bricolage.variable} h-full antialiased`}>
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
