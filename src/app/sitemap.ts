import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPlans } from "@/lib/plans";
import { SITE_URL, localeAlternates } from "@/lib/site";

// Lives outside src/app/[locale]/ so it serves at the unprefixed /sitemap.xml — proxy.ts's
// matcher already excludes any path with a dot in it, so next-intl's locale-redirect middleware
// never touches this route.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const plans = await getPlans();
  const pathnames = ["", "/plans", ...plans.map((plan) => `/plans/${plan.id}`)];

  return pathnames.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${pathname}`,
      alternates: { languages: localeAlternates(pathname) },
    }))
  );
}
