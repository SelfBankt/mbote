import { defineRouting } from "next-intl/routing";

// Lingala first — it's the primary audience (see CLAUDE.md "Languages"). French is DRC's
// official/business language; English covers the wider diaspora/international reach the user
// asked for. Locale codes: ln (Lingala), fr (French), en (English) — ISO 639-1 where available.
export const routing = defineRouting({
  locales: ["ln", "fr", "en"],
  defaultLocale: "ln",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
