import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getGuide } from "@/lib/guides";
import { SITE_URL, localeAlternates } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";

// Structural chrome around the article (back link, "updated on", FAQ heading) — kept as a small
// per-locale map here rather than the next-intl message files, since it only exists on this one
// page. The bottom CTA (text + button + destination) is guide-specific instead — see
// src/lib/guides.ts's ctaHref/ctaText/ctaButtonText — since different guides point at different
// products (eSIM plans vs. data top-ups).
const CHROME: Record<
  string,
  { back: string; updated: string; dateLocale: string; faqTitle: string }
> = {
  fr: {
    back: "Tous les guides",
    updated: "Mis à jour le",
    dateLocale: "fr-FR",
    faqTitle: "Questions fréquentes",
  },
  en: {
    back: "All guides",
    updated: "Updated",
    dateLocale: "en-US",
    faqTitle: "Frequently asked questions",
  },
  ln: {
    back: "Ba guide nyonso",
    updated: "Ebongisami na",
    dateLocale: "fr-FR",
    faqTitle: "Mituna oyo etunamaka mingi",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug, locale);
  if (!guide) return {};
  return {
    title: guide.translation.title,
    description: guide.translation.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides/${guide.slug}`,
      languages: localeAlternates(`/guides/${guide.slug}`),
    },
  };
}

export default async function GuideDetailPage({
  params,
}: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = getGuide(slug, locale);
  if (!guide) notFound();

  const chrome = CHROME[locale] ?? CHROME.fr;
  const t = guide.translation;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t.title,
    description: t.metaDescription,
    datePublished: guide.updatedAt,
    dateModified: guide.updatedAt,
    inLanguage: locale,
    author: { "@type": "Organization", name: "MboteData" },
    publisher: { "@type": "Organization", name: "MboteData" },
    mainEntityOfPage: `${SITE_URL}/${locale}/guides/${guide.slug}`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />

      <Link href="/guides" className="text-sm text-foreground/60 hover:text-brand">
        ← {chrome.back}
      </Link>

      <article className="mt-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-foreground/60">
          {chrome.updated} {new Date(guide.updatedAt).toLocaleDateString(chrome.dateLocale)}
        </p>
        <p className="mt-6 text-lg text-foreground/80">{t.intro}</p>

        {t.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mt-3 text-foreground/80 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {t.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">{chrome.faqTitle}</h2>
            <div className="mt-4 space-y-5">
              {t.faq.map((item) => (
                <div key={item.question}>
                  <h3 className="font-medium">{item.question}</h3>
                  <p className="mt-1 text-foreground/80 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      <div className="mt-10 border border-line rounded-2xl p-5 bg-white/60 flex items-center justify-between gap-4">
        <p className="text-sm text-foreground/70">{t.ctaText}</p>
        <Link
          href={guide.ctaHref}
          className="text-sm font-medium text-white bg-brand rounded-full px-4 py-2 hover:bg-brand-light transition whitespace-nowrap"
        >
          {t.ctaButtonText}
        </Link>
      </div>
    </div>
  );
}
