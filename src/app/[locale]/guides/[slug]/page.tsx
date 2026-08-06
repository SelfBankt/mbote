import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getGuide } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";

// French-only content — see src/lib/guides.ts header for why. Every other locale 404s here
// rather than serving an empty or English-fallback page.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== "fr") return {};
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `${SITE_URL}/fr/guides/${guide.slug}` },
  };
}

export default async function GuideDetailPage({
  params,
}: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  if (locale !== "fr") notFound();
  setRequestLocale(locale);

  const guide = getGuide(slug);
  if (!guide) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.updatedAt,
    dateModified: guide.updatedAt,
    inLanguage: "fr",
    author: { "@type": "Organization", name: "MboteData" },
    publisher: { "@type": "Organization", name: "MboteData" },
    mainEntityOfPage: `${SITE_URL}/fr/guides/${guide.slug}`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
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
        ← Tous les guides
      </Link>

      <article className="mt-6">
        <h1 className="text-3xl font-bold">{guide.title}</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Mis à jour le {new Date(guide.updatedAt).toLocaleDateString("fr-FR")}
        </p>
        <p className="mt-6 text-lg text-foreground/80">{guide.intro}</p>

        {guide.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mt-3 text-foreground/80 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {guide.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Questions fréquentes</h2>
            <div className="mt-4 space-y-5">
              {guide.faq.map((item) => (
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
        <p className="text-sm text-foreground/70">Prêt à vous connecter en RDC ?</p>
        <Link
          href="/plans"
          className="text-sm font-medium text-white bg-brand rounded-full px-4 py-2 hover:bg-brand-light transition whitespace-nowrap"
        >
          Voir les forfaits →
        </Link>
      </div>
    </div>
  );
}
