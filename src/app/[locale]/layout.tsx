import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL, localeAlternates } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const name = t("name");
  const description = t("tagline");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: localeAlternates(""),
    },
    openGraph: {
      title: name,
      description,
      url: `${SITE_URL}/${locale}`,
      siteName: name,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: name,
      description,
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // enables static rendering for this locale's request-scoped data (see next-intl's docs on
  // setRequestLocale) — cheap to call, avoids every page needing to do it individually
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "site" });
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("name"),
    url: SITE_URL,
    description: t("tagline"),
    areaServed: { "@type": "Country", name: "Democratic Republic of the Congo" },
  };

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationJsonLd} />
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
