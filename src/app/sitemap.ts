import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPlans } from "@/lib/plans";
import { getTopups } from "@/lib/topups";
import { getAllGuideSlugs } from "@/lib/guides";
import { SITE_URL, localeAlternates } from "@/lib/site";

// Lives outside src/app/[locale]/ so it serves at the unprefixed /sitemap.xml — proxy.ts's
// matcher already excludes any path with a dot in it, so next-intl's locale-redirect middleware
// never touches this route.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plans, topups] = await Promise.all([getPlans(), getTopups()]);
  const guideSlugs = getAllGuideSlugs();
  const pathnames = [
    "",
    "/plans",
    ...plans.map((plan) => `/plans/${plan.id}`),
    "/topups",
    ...topups.filter((topup) => topup.available).map((topup) => `/topups/${topup.id}`),
    "/guides",
    ...guideSlugs.map((slug) => `/guides/${slug}`),
  ];

  return pathnames.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${pathname}`,
      alternates: { languages: localeAlternates(pathname) },
    }))
  );
}
