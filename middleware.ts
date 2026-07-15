import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/home",
  "/games",
  "/auction-draft",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/guess-who(.*)",
  "/lineup-guesser(.*)",
  "/challenges(.*)",
  "/higher-lower(.*)",
  "/connections(.*)",
  "/simulations(.*)",
  "/franchise(.*)",
  "/sitemap.xml",
  "/robots.txt",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
