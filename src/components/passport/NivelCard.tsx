"use client";

import { useLocale, useTranslations } from "next-intl";

import { enIdioma } from "@/lib/idioma";
import { progreso, type Nivel } from "@/lib/loyalty";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export function NivelCard({ niveles }: { niveles: Nivel[] }) {
  const t = useTranslations("pasaporte");
  const locale = useLocale();
  const hydrated = useHydrated();
  const puntos = useAppStore((s) => s.puntos);
  if (!hydrated) return <div className="h-32 rounded-card bg-morado/80" />;
  const p = progreso(puntos, niveles);
  return (
    <section className="flex flex-col gap-2 rounded-card bg-morado p-4 text-crema" aria-label={t("nivel", { nivel: p.actual.nivel })}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-3xl text-dorado-200">{t("nivel", { nivel: p.actual.nivel })}</p>
        <p className="font-display text-2xl">{t("puntos", { n: puntos })}</p>
      </div>
      <div className="h-3 overflow-hidden rounded-pill bg-morado-900/60" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.pct} aria-label={p.siguiente ? t("faltan", { n: p.faltan, nivel: p.siguiente.nivel }) : t("maximo")}>
        <div className="h-full rounded-pill bg-dorado transition-[width] duration-500" style={{ width: `${p.pct}%` }} />
      </div>
      <p className="text-sm">{p.siguiente ? t("faltan", { n: p.faltan, nivel: p.siguiente.nivel }) : t("maximo")}</p>
      <p className="text-[13px] text-crema/80">{t("beneficio", { beneficio: enIdioma(p.actual, "beneficio", locale) })}</p>
    </section>
  );
}
