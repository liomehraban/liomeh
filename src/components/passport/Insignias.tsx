"use client";

import { Award, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { enIdioma } from "@/lib/idioma";
import type { ContextoInsignias } from "@/lib/loyalty";
import type { Lealtad } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/store/useAppStore";
import { useInsignias } from "./usePasaporte";

export function Insignias({ insignias, ctx }: { insignias: Lealtad["insignias"]; ctx: ContextoInsignias }) {
  const t = useTranslations("pasaporte");
  const locale = useLocale();
  const hydrated = useHydrated();
  const on = useInsignias(ctx);
  // Desbloqueadas primero (orden estable: dentro de cada grupo se respeta el de los datos).
  const ordenadas = hydrated ? [...insignias].sort((a, b) => Number(on.has(b.id)) - Number(on.has(a.id))) : insignias;
  return (
    <section aria-labelledby="insignias" className="flex flex-col gap-3">
      <h2 id="insignias" className="text-xl font-bold text-morado-700">
        {t("insignias")}
      </h2>
      <ul data-revelar className="grid grid-cols-2 gap-3">
        {ordenadas.map((i) => {
          const ok = hydrated && on.has(i.id);
          return (
            <li key={i.id} className={cn("flex flex-col gap-1 rounded-card border p-3", ok ? "border-dorado bg-dorado-200/60" : "border-border bg-white")}>
              <span className={cn("grid size-10 place-items-center rounded-full", ok ? "bg-dorado text-morado-900" : "bg-gris/20 text-gris")} aria-hidden>
                {ok ? <Award className="size-5" /> : <Lock className="size-4" />}
              </span>
              <span className="font-bold">{enIdioma(i, "nombre", locale)}</span>
              <span className="text-[13px] text-tinta-2">{enIdioma(i, "regla", locale)}</span>
              <span className={cn("text-[12px] font-bold", ok ? "text-nopal-700" : "text-tinta-2")}>{ok ? t("desbloqueada") : t("bloqueada")}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
