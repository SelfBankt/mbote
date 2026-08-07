import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header() {
  const t = useTranslations();

  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static local PNG, no benefit from next/image here */}
          <img src="/brand/logo.png" alt={t("site.name")} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/topups" className="hover:text-accent transition-colors">
            {t("nav.topups")}
          </Link>
          <Link href="/plans" className="hover:text-accent transition-colors">
            {t("nav.plans")}
          </Link>
          <Link href="/guides" className="hover:text-accent transition-colors">
            {t("nav.guides")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
