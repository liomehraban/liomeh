"use client";

import { ChevronRight, Loader2, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { PASOS, progreso, type PasoDemo } from "@/lib/presentacion";

export const persona = (p: PasoDemo) =>
  p.perfil === "consumidor" ? (p.locale === "en" ? "turista" : "consumidora") : p.perfil;

/** Barra inferior del modo presentación: paso actual, progreso, «Siguiente» y «Reiniciar demo». */
export function BarraPresentacion({
  paso,
  ejecutando,
  interrumpido,
  onSiguiente,
  onReintentar,
  onReiniciar,
  onSalir,
}: {
  paso: number;
  ejecutando: boolean;
  interrumpido: boolean;
  onSiguiente: () => void;
  onReintentar: () => void;
  onReiniciar: () => void;
  onSalir: () => void;
}) {
  const t = useTranslations("presentacion");
  const actual = PASOS[paso];
  const ultimo = paso >= PASOS.length - 1;
  const pct = Math.round(progreso(paso) * 100);

  return (
    <div
      role="region"
      aria-label={t("titulo")}
      data-presentacion
      className="fixed inset-x-0 bottom-0 z-50 bg-morado-900 text-crema shadow-[0_-8px_24px_rgba(62,28,60,0.35)]"
    >
      <div role="progressbar" aria-label={t("progreso")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-1 bg-crema/20">
        <div className="h-full bg-dorado transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={onSalir} aria-label={t("salir")} className="grid size-11 shrink-0 place-items-center rounded-pill hover:bg-crema/10">
          <X className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={onReiniciar} aria-label={t("reiniciar")} title={t("reiniciar")} className="grid size-11 shrink-0 place-items-center rounded-pill hover:bg-crema/10">
          <RotateCcw className="size-5" aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 flex-col px-1" aria-live="polite">
          {actual ? (
            <>
              <span className="truncate text-xs font-bold tracking-wide text-dorado uppercase">
                {t("pasoDe", { n: paso + 1, total: PASOS.length })} · {t(`perfiles.${persona(actual)}`)}
              </span>
              <span className="line-clamp-2 text-[13px] leading-tight font-semibold">
                {interrumpido ? t("interrumpido") : t(`pasos.${actual.id}.titulo` as "pasos.buscar.titulo")}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-semibold">{t("titulo")}</span>
          )}
        </div>
        <button
          type="button"
          onClick={interrumpido ? onReintentar : onSiguiente}
          disabled={ejecutando}
          data-demo-siguiente
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-pill bg-dorado px-4 text-sm font-bold text-morado-900 disabled:opacity-70"
        >
          {ejecutando ? (
            <>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              {t("ejecutando")}
            </>
          ) : (
            <>
              {interrumpido ? t("reintentar") : paso < 0 ? t("comenzar") : ultimo ? t("terminar") : t("siguiente")}
              {interrumpido ? <RotateCcw className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
