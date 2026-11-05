import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Leckerli_One, Shrikhand } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// Headings: Shrikhand (Vee tried a logo-style script on 2026-11-04 and
// preferred this). Body: Bricolage Grotesque.
const shrikhand = Shrikhand({
  variable: "--font-shrikhand",
  subsets: ["latin"],
  weight: "400",
});

// Leckerli One: closest Google font to the "Stash" script in Vee's logo,
// used only for the big "Stash" on the home page (Vee, 2026-11-04).
const leckerli = Leckerli_One({
  variable: "--font-leckerli",
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
          colorPrimary: "#f07020",
          fontFamily: "var(--font-bricolage)",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en-CA" className={`${shrikhand.variable} ${leckerli.variable} ${bricolage.variable} h-full antialiased`}>
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
