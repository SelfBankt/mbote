import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPlans, formatData } from "@/lib/plans";
import { SITE_URL, localeAlternates } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/plans">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plans" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/plans`,
      languages: localeAlternates("/plans"),
    },
  };
}

export default async function PlansPage({ params }: PageProps<"/[locale]/plans">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, plans] = await Promise.all([getTranslations(), getPlans()]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-bold">{t("plans.title")}</h1>
      <p className="mt-2 text-foreground/70">{t("plans.subtitle")}</p>

      {plans.length === 0 ? (
        <p className="mt-10 text-foreground/60">{t("plans.empty")}</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}`}
              className="block border border-line rounded-2xl p-5 bg-white/60 hover:border-brand hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">
                  {plan.network}
                </span>
                <span className="text-xs bg-accent-soft text-brand rounded-full px-2 py-0.5 font-medium">
                  {t("plans.networkLabel")}
                </span>
              </div>
              <div className="mt-4 text-2xl font-bold">{formatData(plan.dataAmountMb)}</div>
              <div className="text-sm text-foreground/70">
                {t("plans.validityLabel")} {plan.validityDays} {t("planDetail.days")}
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-foreground/60">{t("plans.priceFrom")} </span>
                  <span className="text-xl font-semibold text-brand">${plan.priceUsd}</span>
                </div>
                <span className="text-sm font-medium text-accent">{t("plans.viewPlan")} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
