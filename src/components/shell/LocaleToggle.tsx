"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

/** Selector ES/EN: cada opción mide 44 px de alto (área táctil completa); la pista suma 4 px de aire por lado. */
export function LocaleToggle({ className }: { className?: string }) {
  const t = useTranslations("shell");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const setLocale = useAppStore((s) => s.setLocale);
  const [pending, startTransition] = useTransition();

  const cambiar = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    const qs = window.location.search.slice(1);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { locale: next }));
  };

  return (
    <div
      role="group"
      aria-label={t("cambiarIdioma")}
      className={cn("flex items-center gap-0.5 rounded-pill bg-white p-1 shadow-sm", pending && "opacity-70", className)}
    >
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          onClick={() => cambiar(l)}
          className={cn(
            "h-11 min-w-12 rounded-pill px-3 text-sm font-bold uppercase transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            locale === l ? "bg-primary text-primary-foreground" : "text-morado-700 hover:bg-morado-50",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
