import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPlan, formatData } from "@/lib/plans";
import { Link } from "@/i18n/navigation";
import { SITE_URL, localeAlternates } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { NetworkLogo } from "@/components/NetworkLogo";
import BuyForm from "./BuyForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/plans/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const [t, plan] = await Promise.all([
    getTranslations({ locale, namespace: "planDetail" }),
    getPlan(id),
  ]);
  if (!plan) return {};

  const values = { data: formatData(plan.dataAmountMb), network: plan.network, days: plan.validityDays };
  return {
    title: t("metaTitle", values),
    description: t("metaDescription", values),
    alternates: {
      canonical: `${SITE_URL}/${locale}/plans/${id}`,
      languages: localeAlternates(`/plans/${id}`),
    },
  };
}

export default async function PlanDetailPage({ params }: PageProps<"/[locale]/plans/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, plan] = await Promise.all([getTranslations(), getPlan(id)]);
  if (!plan) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${plan.network} eSIM — ${formatData(plan.dataAmountMb)}`,
    description: t("planDetail.metaDescription", {
      data: formatData(plan.dataAmountMb),
      network: plan.network,
      days: plan.validityDays,
    }),
    brand: { "@type": "Brand", name: "MboteData" },
    offers: {
      "@type": "Offer",
      price: plan.priceUsd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${locale}/plans/${id}`,
    },
  };

  const afterPurchaseSteps = [
    t("planDetail.afterPurchaseStep1"),
    t("planDetail.afterPurchaseStep2"),
    t("planDetail.afterPurchaseStep3"),
  ];

  const terms = [
    t("planDetail.dataOnlyNote"),
    t("planDetail.termsValidity", { days: plan.validityDays }),
    t("planDetail.termsNonRefundable"),
    t("planDetail.termsLogoDisclaimer"),
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <JsonLd data={productJsonLd} />
      <Link href="/plans" className="text-sm text-foreground/60 hover:text-brand">
        ← {t("planDetail.backToPlans")}
      </Link>

      <div className="relative mt-6 border border-line rounded-2xl p-6 bg-white/60">
        <NetworkLogo network={plan.network} className="absolute top-6 right-6 h-16 md:h-20 w-auto" />
        <h1 className="text-3xl font-bold pr-32 md:pr-40">{formatData(plan.dataAmountMb)}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-foreground/60">{t("planDetail.dataAmount")}</dt>
            <dd className="font-medium">{formatData(plan.dataAmountMb)}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">{t("planDetail.validity")}</dt>
            <dd className="font-medium">
              {plan.validityDays} {t("planDetail.days")}
            </dd>
          </div>
        </dl>
        <div className="mt-6 text-3xl font-bold text-brand">${plan.priceUsd}</div>

        <div className="mt-6">
          <BuyForm planId={plan.id} locale={locale} />
        </div>
      </div>

      <div className="mt-6 border border-line rounded-2xl p-6 bg-white/60">
        <h2 className="font-semibold">{t("planDetail.whatsIncludedTitle")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li className="flex gap-2">
            <span aria-hidden>📶</span>
            {t("planDetail.dataOnlyNote")}
          </li>
          <li className="flex gap-2">
            <span aria-hidden>🌍</span>
            {t("planDetail.coverageNote", { network: plan.network })}
          </li>
          <li className="flex gap-2">
            <span aria-hidden>📱</span>
            {t("planDetail.compatibilityNote")}
          </li>
        </ul>
        <Link
          href="/guides/comment-installer-esim-rdc"
          className="inline-block mt-4 text-sm font-medium text-brand hover:text-accent transition-colors"
        >
          {t("planDetail.guideLinkText")} →
        </Link>
      </div>

      <div className="mt-6 border border-line rounded-2xl p-6 bg-white/60">
        <h2 className="font-semibold">{t("planDetail.afterPurchaseTitle")}</h2>
        <ol className="mt-3 space-y-3">
          {afterPurchaseSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 rounded-2xl border border-line p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
          {t("planDetail.termsTitle")}
        </h2>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground/60">
          {terms.map((term, i) => (
            <li key={i}>· {term}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
