import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPlan, formatData } from "@/lib/plans";
import { Link } from "@/i18n/navigation";
import { SITE_URL, localeAlternates } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
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

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <JsonLd data={productJsonLd} />
      <Link href="/plans" className="text-sm text-foreground/60 hover:text-brand">
        ← {t("planDetail.backToPlans")}
      </Link>

      <div className="mt-6 border border-line rounded-2xl p-6 bg-white/60">
        <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">
          {t("planDetail.networkNote")}: {plan.network}
        </span>
        <h1 className="text-3xl font-bold mt-2">{formatData(plan.dataAmountMb)}</h1>
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
    </div>
  );
}
