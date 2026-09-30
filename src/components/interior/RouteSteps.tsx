"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Footprints, PartyPopper, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { RutaInterior } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Confeti } from "./Confeti";

/** Pasos de la ruta con el actual resaltado; Anterior/Siguiente en el tercio inferior. */
export function RouteSteps({
  ruta,
  paso,
  onPaso,
  onTerminar,
  nombrePuesto,
}: {
  ruta: RutaInterior;
  paso: number;
  onPaso: (i: number) => void;
  onTerminar: () => void;
  nombrePuesto: string;
}) {
  const t = useTranslations("interior");
  const ultimo = ruta.pasos.length - 1;
  const llegaste = paso >= ultimo;
  const lista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    lista.current?.querySelector(`[data-paso="${paso}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [paso]);

  return (
    <section aria-label={t("total", { metros: ruta.distancia_m, minutos: ruta.minutos_caminando })} className="relative flex flex-col gap-3">
      {llegaste && <Confeti />}
      <div className="flex items-center gap-2">
        <Footprints className="size-5 text-morado" aria-hidden />
        <p className="font-bold text-morado-700">{t("total", { metros: ruta.distancia_m, minutos: ruta.minutos_caminando })}</p>
        <p className="text-sm text-tinta-2" aria-live="polite">
          · {t("paso", { n: Math.min(paso + 1, ruta.pasos.length), total: ruta.pasos.length })}
        </p>
        <button
          type="button"
          onClick={onTerminar}
          aria-label={t("otraRuta")}
          className="ml-auto grid size-11 place-items-center rounded-pill text-tinta-2 hover:bg-morado-50"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {llegaste ? (
        <div className="flex flex-col items-center gap-2 rounded-card bg-nopal-700 p-4 text-center text-white" role="status">
          <PartyPopper className="size-8" aria-hidden />
          <p className="font-display text-4xl">{t("llegaste")}</p>
          <p>{t("llegasteTexto", { nombre: nombrePuesto })}</p>
        </div>
      ) : (
        <ol ref={lista} className="flex max-h-28 flex-col gap-1 overflow-y-auto">
          {ruta.pasos.map((p, i) => (
            <li
              key={p.n}
              data-paso={i}
              aria-current={i === paso ? "step" : undefined}
              className={cn(
                "flex gap-3 rounded-2xl px-3 py-2 text-sm transition-colors",
                i === paso ? "bg-morado text-crema" : i < paso ? "text-gris line-through decoration-gris/50" : "text-tinta-2",
              )}
            >
              <span className="font-bold">{p.n}</span>
              <span>{p.instruccion}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" disabled={paso === 0} onClick={() => onPaso(paso - 1)}>
          <ChevronLeft aria-hidden />
          {t("anterior")}
        </Button>
        {llegaste ? (
          <Button asChild className="flex-[1.4]">
            <Link href={`/puesto/${ruta.hacia_puesto}`}>{t("verMenu")}</Link>
          </Button>
        ) : (
          <Button className="flex-[1.4]" onClick={() => onPaso(paso + 1)} data-demo="ruta-siguiente">
            {t("siguiente")}
            <ChevronRight aria-hidden />
          </Button>
        )}
      </div>
    </section>
  );
}
