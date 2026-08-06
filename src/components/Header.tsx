import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header() {
  const t = useTranslations();

  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-brand">
          <span aria-hidden>📶</span>
          {t("site.name")}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/plans" className="hover:text-accent transition-colors">
            {t("nav.plans")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
