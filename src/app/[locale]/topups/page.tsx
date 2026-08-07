import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatData, formatPricePerGb } from "@/lib/plans";
import { getTopups } from "@/lib/topups";
import { SITE_URL, localeAlternates } from "@/lib/site";
import { NetworkLogo } from "@/components/NetworkLogo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/topups">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "topups" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/topups`,
      languages: localeAlternates("/topups"),
    },
  };
}

export default async function TopupsPage({ params }: PageProps<"/[locale]/topups">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, topups] = await Promise.all([getTranslations(), getTopups()]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-bold">{t("topups.title")}</h1>
      <p className="mt-2 text-foreground/70">{t("topups.subtitle")}</p>
      <p className="mt-1 text-sm text-accent font-medium">{t("topups.badge")}</p>

      {topups.length === 0 ? (
        <p className="mt-10 text-foreground/60">{t("topups.empty")}</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topups.map((topup) =>
            topup.available ? (
              <Link
                key={topup.id}
                href={`/topups/${topup.id}`}
                className="relative block border border-line rounded-2xl p-5 bg-white/60 hover:border-brand hover:shadow-sm transition"
              >
                <NetworkLogo network={topup.network} className="absolute top-5 right-5 h-10 w-auto" />
                <div className="mt-4 text-2xl font-bold pr-16">{formatData(topup.dataAmountMb)}</div>
                <div className="text-sm text-foreground/70">
                  {t("topups.validityLabel")} {topup.validityDays} {t("planDetail.days")}
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-foreground/60">{t("topups.priceFrom")} </span>
                    <span className="text-xl font-semibold text-brand">${topup.priceUsd}</span>
                    <div className="text-xs text-foreground/50">
                      {formatPricePerGb(topup.priceUsd, topup.dataAmountMb)}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-accent">{t("topups.viewTopup")} →</span>
                </div>
              </Link>
            ) : (
              <div
                key={topup.id}
                className="relative block border border-line rounded-2xl p-5 bg-white/30 opacity-60"
              >
                <NetworkLogo network={topup.network} className="absolute top-5 right-5 h-10 w-auto grayscale" />
                <div className="mt-4 text-lg font-semibold pr-16">{topup.network}</div>
                <div className="mt-6 text-sm text-foreground/60">{t("topups.comingSoon")}</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
