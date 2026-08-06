import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPlans } from "@/lib/plans";
import { getGuides } from "@/lib/guides";
import { SITE_URL, localeAlternates } from "@/lib/site";

// Lives outside src/app/[locale]/ so it serves at the unprefixed /sitemap.xml — proxy.ts's
// matcher already excludes any path with a dot in it, so next-intl's locale-redirect middleware
// never touches this route.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const plans = await getPlans();
  const pathnames = ["", "/plans", ...plans.map((plan) => `/plans/${plan.id}`)];

  const perLocaleUrls = pathnames.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${pathname}`,
      alternates: { languages: localeAlternates(pathname) },
    }))
  );

  // Guides are French-only (see src/lib/guides.ts) — no hreflang alternates, since there's no
  // ln/en version for those to point to.
  const guides = getGuides();
  const guideUrls = ["/guides", ...guides.map((guide) => `/guides/${guide.slug}`)].map(
    (pathname) => ({ url: `${SITE_URL}/fr${pathname}` })
  );

  return [...perLocaleUrls, ...guideUrls];
}
