"use client";

import { ChevronRight, Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { useVocabulario } from "@/hooks/useVocabulario";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/**
 * Renglón «Plan actual: Pro ›» de Cuenta. Con `href` es un enlace a la página del plan. En locatario (`delStore`)
 * el plan sale del store (puede haber cambiado en la demo); antes de hidratar, del plan de los datos demo.
 */
export function FilaPlan({ plan, href, delStore = false }: { plan: string; href?: string; delStore?: boolean }) {
  const t = useTranslations("locatario.plan");
  const v = useVocabulario();
  const hydrated = useHydrated();
  const guardado = useAppStore((s) => s.locatario.plan);
  const actual = delStore && hydrated && guardado ? guardado : plan;
  const contenido = (
    <>
      <span className="flex items-center gap-2 font-semibold">
        {actual !== "Gratis" && <Crown className="size-4 text-dorado" aria-hidden />}
        {t("actual")}: {v("planes", actual)}
      </span>
      {href && <ChevronRight className="size-5 text-morado" aria-hidden />}
    </>
  );
  const clase = "flex min-h-11 items-center justify-between gap-3 py-1";
  return href ? (
    <Link href={href} className={cn(clase, "rounded-xl text-tinta hover:text-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none")}>
      {contenido}
    </Link>
  ) : (
    <p className={clase}>{contenido}</p>
  );
}
