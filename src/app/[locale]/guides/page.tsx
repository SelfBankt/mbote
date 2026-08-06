import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getGuides } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

// French-only content — see src/lib/guides.ts header for why. Every other locale 404s here
// rather than serving an empty or English-fallback listing.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides">): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "fr") return {};
  return {
    title: "Guides eSIM RDC",
    description:
      "Guides pratiques pour choisir, payer et installer une eSIM en République Démocratique du Congo.",
    alternates: { canonical: `${SITE_URL}/fr/guides` },
  };
}

export default async function GuidesIndexPage({ params }: PageProps<"/[locale]/guides">) {
  const { locale } = await params;
  if (locale !== "fr") notFound();
  setRequestLocale(locale);

  const guides = getGuides();

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-bold">Guides eSIM RDC</h1>
      <p className="mt-2 text-foreground/70">
        Guides pratiques pour choisir, payer et installer une eSIM en République Démocratique du
        Congo.
      </p>

      <div className="mt-8 space-y-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block border border-line rounded-2xl p-5 bg-white/60 hover:border-brand hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold">{guide.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{guide.metaDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
