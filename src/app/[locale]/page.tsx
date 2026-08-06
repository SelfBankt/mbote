import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations();
  const steps = [
    { title: t("home.step1Title"), body: t("home.step1Body"), icon: "🔍" },
    { title: t("home.step2Title"), body: t("home.step2Body"), icon: "⚡" },
    { title: t("home.step3Title"), body: t("home.step3Body"), icon: "📶" },
  ];

  return (
    <div>
      <section className="bg-brand text-white">
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto text-balance">
            {t("home.heroSubtitle")}
          </p>
          <Link
            href="/plans"
            className="inline-block mt-8 bg-accent text-brand font-semibold rounded-full px-8 py-3 hover:brightness-105 transition"
          >
            {t("home.cta")}
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10">{t("home.howItWorksTitle")}</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3" aria-hidden>
                {step.icon}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-foreground/70">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
