import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-line mt-auto">
      <div className="max-w-5xl mx-auto px-5 py-6 text-xs text-foreground/60 text-center">
        {t("footer.tagline")}
      </div>
    </footer>
  );
}
