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
    { title: t("home.step1Title"), body: t("home.step1Body") },
    { title: t("home.step2Title"), body: t("home.step2Body") },
    { title: t("home.step3Title"), body: t("home.step3Body") },
  ];
  const badges = [
    { icon: "🌍", label: t("home.badgeNetwork") },
    { icon: "⚡", label: t("home.badgePayment") },
    { icon: "📧", label: t("home.badgeDelivery") },
  ];

  return (
    <div>
      {/* Decorative blobs only animate `transform`/`opacity` (compositor-only, cheap even on
          low-end devices) — see globals.css. Nothing here is an image, so this section adds zero
          network weight. */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-brand-light/60 blur-[110px] animate-blob-1"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -right-24 h-[40rem] w-[40rem] rounded-full bg-brand-light/60 blur-[110px] animate-blob-2"
        />
        <div
          aria-hidden
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[130px]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]"
        />

        <div className="relative max-w-5xl mx-auto px-5 py-24 md:py-28 text-center">
          <h1 className="animate-fade-in-up text-balance" style={{ animationDelay: "0ms" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small static local PNG, no benefit from next/image here */}
            <img
              src="/brand/logo-white.png"
              alt={t("site.name")}
              className="h-[51px] md:h-[74px] w-auto mx-auto"
            />
            <span className="block mt-3 text-4xl md:text-6xl font-bold tracking-tight">
              {t("home.heroTitleLine2")}
            </span>
          </h1>

          <p
            className="animate-fade-in-up mt-5 text-lg text-white/80 max-w-xl mx-auto text-balance"
            style={{ animationDelay: "160ms" }}
          >
            {t("home.heroSubtitle")}
          </p>

          <div
            className="animate-fade-in-up mt-9"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/plans"
              className="inline-block bg-accent text-brand font-semibold rounded-full px-8 py-3.5 shadow-[0_8px_30px_-8px_rgba(255,131,0,0.6)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,131,0,0.7)] transition-all"
            >
              {t("home.cta")}
            </Link>
          </div>

          <div
            className="animate-fade-in-up mt-12 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "320ms" }}
          >
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/15"
              >
                <span aria-hidden>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative border border-line rounded-2xl p-6 bg-white/60 hover:border-brand hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <h3 className="text-xl md:text-2xl font-bold">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-balance">
            {t("home.finalCtaTitle")}
          </h2>
          <Link
            href="/plans"
            className="inline-block mt-6 bg-accent text-brand font-semibold rounded-full px-8 py-3.5 hover:brightness-105 hover:-translate-y-0.5 transition-all"
          >
            {t("home.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
