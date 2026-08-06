import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Named `proxy.ts`, not `middleware.ts` — this Next.js version (16) renamed the file convention;
// `middleware.ts` is deprecated. next-intl's createIntlMiddleware still returns a plain request
// handler function, so it's exported here under the new required name.
export const proxy = createIntlMiddleware(routing);

export const config = {
  // matches every path except static assets, image optimization, and API routes — API routes
  // aren't locale-prefixed (see src/app/api/*) and don't need locale negotiation
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
