import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Customer accounts (Clerk). Only the account area needs a login; everything
// else, including checkout, stays open to guests.
const isAccountPage = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAccountPage(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
