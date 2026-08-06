import { routing } from "@/i18n/routing";

// Canonical production origin — single deployment target (see CLAUDE.md "Deployment"), so a
// hardcoded constant is simpler than threading an env var through every metadata call.
export const SITE_URL = "https://mbotedata.com";

// Builds the `alternates.languages` object for Next's Metadata API (hreflang tags) from a
// locale-less pathname (e.g. "" for home, "/plans", "/plans/cd-vodacom-1gb-7d"). Every route
// exists at the same path under every locale — routing.ts has no per-locale `pathnames` mapping —
// so this is just locale-prefixing, not real per-locale URL translation.
export function localeAlternates(pathname: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${pathname}`])
  );
}
