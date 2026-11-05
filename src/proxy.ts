import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Customer accounts (Clerk). Only the account area needs a login; everything
// else, including checkout, stays open to guests.
const isAccountPage = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAccountPage(req)) await auth.protect();
});

// Clerk only runs where a login matters: the account area, the login pages,
// API routes and form submissions (server actions, sent with a `next-action`
// header). Shop pages skip it, so a visitor's first page load never waits on
// a Clerk redirect (with development keys that redirect left phones on a
// blank page). Login state on shop pages comes from Clerk's browser code.
const STATIC = "(?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))";

export const config = {
  matcher: [
    "/account/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/(api|trpc)(.*)",
    { source: `/(${STATIC}.*)`, has: [{ type: "header", key: "next-action" }] },
  ],
};
