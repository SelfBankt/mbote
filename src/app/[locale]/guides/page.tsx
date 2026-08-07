import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getGuides } from "@/lib/guides";
import { SITE_URL, localeAlternates } from "@/lib/site";

const INDEX_TITLE: Record<string, { title: string; description: string }> = {
  fr: {
    title: "Guides eSIM et Recharge RDC",
    description:
      "Guides pratiques pour choisir, payer, installer une eSIM, ou recharger des données mobiles en République Démocratique du Congo.",
  },
  en: {
    title: "DR Congo eSIM & Top-up Guides",
    description:
      "Practical guides for choosing, paying for, and installing an eSIM, or topping up mobile data, in DR Congo.",
  },
  ln: {
    title: "Ba guide ya eSIM na Recharge ya Kongo",
    description:
      "Ba guide ya practique mpo na kopona, kofuta, kotia eSIM, to kotondisa données mobile na Kongo.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides">): Promise<Metadata> {
  const { locale } = await params;
  const copy = INDEX_TITLE[locale] ?? INDEX_TITLE.fr;
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides`,
      languages: localeAlternates("/guides"),
    },
  };
}

export default async function GuidesIndexPage({ params }: PageProps<"/[locale]/guides">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = INDEX_TITLE[locale] ?? INDEX_TITLE.fr;
  const guides = getGuides(locale);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-bold">{copy.title}</h1>
      <p className="mt-2 text-foreground/70">{copy.description}</p>

      <div className="mt-8 space-y-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block border border-line rounded-2xl p-5 bg-white/60 hover:border-brand hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold">{guide.translation.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{guide.translation.metaDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
