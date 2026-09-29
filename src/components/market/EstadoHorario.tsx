"use client";

import { useLocale, useTranslations } from "next-intl";

import { useAhora } from "@/hooks/useAhora";
import { ahoraCDMX, estadoHorario } from "@/lib/horario";
import { formatMinutos, nombreDiaLargo } from "@/lib/horarioTexto";
import type { Horario } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/** Estado «abierto ahora» en hora CDMX, siempre con texto (el color nunca va solo). */
export function EstadoHorario({ horario, className, corto = false }: { horario?: Horario; className?: string; corto?: boolean }) {
  const t = useTranslations("horario");
  const locale = useLocale();
  const now = useAhora();

  if (!horario) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-tinta-2", className)}>
        <span aria-hidden className="size-2 rounded-full bg-gris" />
        {corto ? t("desconocidoCorto") : t("desconocido")}
      </span>
    );
  }
  if (!now) return <span className={cn("inline-block h-5 w-32 rounded-pill bg-morado-50", className)} aria-hidden />;

  const e = estadoHorario(horario, now);
  let texto: string;
  if (e.estado === "abierto") {
    texto = e.es24h ? t("abierto24") : corto ? t("abierto") : t("cierraEn", { tiempo: formatMinutos(e.cierraEn) });
  } else if (e.estado === "cerrado") {
    const hoy = ahoraCDMX(now).dia;
    const dif = (e.abreDia - hoy + 7) % 7;
    texto = corto
      ? t("cerrado")
      : dif === 0
        ? t("abreHoy", { hora: e.abre })
        : dif === 1
          ? t("abreManana", { hora: e.abre })
          : t("abreDia", { dia: nombreDiaLargo(e.abreDia, locale), hora: e.abre });
  } else {
    texto = t("desconocidoCorto");
  }
  const abierto = e.estado === "abierto";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", abierto ? "text-nopal" : "text-tinta-2", className)}>
      <span aria-hidden className={cn("size-2 rounded-full", abierto ? "bg-nopal" : "bg-gris")} />
      {texto}
    </span>
  );
}
