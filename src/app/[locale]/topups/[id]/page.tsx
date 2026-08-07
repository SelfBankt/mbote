import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { formatData } from "@/lib/plans";
import { getTopup } from "@/lib/topups";
import { Link } from "@/i18n/navigation";
import { SITE_URL, localeAlternates } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { NetworkLogo } from "@/components/NetworkLogo";
import BuyForm from "@/components/BuyForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/topups/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const [t, topup] = await Promise.all([
    getTranslations({ locale, namespace: "topupDetail" }),
    getTopup(id),
  ]);
  if (!topup || !topup.available) return {};

  const values = { data: formatData(topup.dataAmountMb), network: topup.network, days: topup.validityDays };
  return {
    title: t("metaTitle", values),
    description: t("metaDescription", values),
    alternates: {
      canonical: `${SITE_URL}/${locale}/topups/${id}`,
      languages: localeAlternates(`/topups/${id}`),
    },
  };
}

export default async function TopupDetailPage({ params }: PageProps<"/[locale]/topups/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, topup] = await Promise.all([getTranslations(), getTopup(id)]);
  // unavailable topups (no confirmed Reloadly data product yet, see topups.ts) aren't linked from
  // the listing page and have nothing purchasable to show — treat like any other unknown id
  if (!topup || !topup.available) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${topup.network} Data Top-up — ${formatData(topup.dataAmountMb)}`,
    description: t("topupDetail.metaDescription", {
      data: formatData(topup.dataAmountMb),
      network: topup.network,
      days: topup.validityDays,
    }),
    brand: { "@type": "Brand", name: "MboteData" },
    offers: {
      "@type": "Offer",
      price: topup.priceUsd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${locale}/topups/${id}`,
    },
  };

  const afterPurchaseSteps = [
    t("topupDetail.afterPurchaseStep1"),
    t("topupDetail.afterPurchaseStep2"),
    t("topupDetail.afterPurchaseStep3"),
  ];

  const terms = [
    t("topupDetail.termsActiveSimRequired"),
    t("planDetail.termsValidity", { days: topup.validityDays }),
    t("topupDetail.termsNonRefundable"),
    t("planDetail.termsLogoDisclaimer"),
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <JsonLd data={productJsonLd} />
      <Link href="/topups" className="text-sm text-foreground/60 hover:text-brand">
        ← {t("topupDetail.backToTopups")}
      </Link>

      <div className="relative mt-6 border border-line rounded-2xl p-6 bg-white/60">
        <NetworkLogo network={topup.network} className="absolute top-6 right-6 h-16 md:h-20 w-auto" />
        <h1 className="text-3xl font-bold pr-32 md:pr-40">{formatData(topup.dataAmountMb)}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-foreground/60">{t("planDetail.dataAmount")}</dt>
            <dd className="font-medium">{formatData(topup.dataAmountMb)}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">{t("planDetail.validity")}</dt>
            <dd className="font-medium">
              {topup.validityDays} {t("planDetail.days")}
            </dd>
          </div>
        </dl>
        <div className="mt-6 text-3xl font-bold text-brand">${topup.priceUsd}</div>

        <div className="mt-6">
          <BuyForm planId={topup.id} locale={locale} productType="topup" />
        </div>
      </div>

      <div className="mt-6 border border-line rounded-2xl p-6 bg-white/60">
        <h2 className="font-semibold">{t("planDetail.whatsIncludedTitle")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li className="flex gap-2">
            <span aria-hidden>📶</span>
            {t("topupDetail.worksOnExistingSimNote")}
          </li>
          <li className="flex gap-2">
            <span aria-hidden>🌍</span>
            {t("planDetail.coverageNote", { network: topup.network })}
          </li>
          <li className="flex gap-2">
            <span aria-hidden>⚡</span>
            {t("topupDetail.speedNote")}
          </li>
        </ul>
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
