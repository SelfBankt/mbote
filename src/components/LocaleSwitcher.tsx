"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

const LABELS: Record<string, string> = { ln: "Lingala", fr: "Français", en: "English" };

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => {
        router.replace(
          // @ts-expect-error -- pathname/params come from the current route, which is always valid
          { pathname, params },
          { locale: e.target.value }
        );
      }}
      className="bg-transparent border border-line rounded-full px-3 py-1.5 text-sm cursor-pointer"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}
