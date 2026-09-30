"use client";

import { Bike, Clock, Smartphone, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useVocabulario } from "@/hooks/useVocabulario";
import { ESTADOS_LOCATARIO, siguienteEstadoLocatario, type EstadoLocatario } from "@/lib/locatario";
import { formatMXN } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoPerfil } from "./EncabezadoPerfil";

const COLOR = { nuevo: "bg-cempasuchil text-morado-900", preparando: "bg-morado-50 text-morado-700", listo: "bg-nopal-700 text-white", entregado: "bg-gris/20 text-tinta-2" } as const;

/** Locatario › Pedidos: incluye los creados por consumidores (M5) con folio; cada uno avanza de estado. */
export function PedidosView() {
  const t = useTranslations("locatario.pedidos");
  const locale = useLocale();
  const voc = useVocabulario();
  const hydrated = useHydrated();
  const pedidos = useAppStore((s) => s.locatario.pedidos);
  const avanzar = useAppStore((s) => s.avanzarPedidoLocatario);
  const orden = [...pedidos].sort((a, b) => ESTADOS_LOCATARIO.indexOf(a.estado ?? "nuevo") - ESTADOS_LOCATARIO.indexOf(b.estado ?? "nuevo"));

  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={t("titulo")} />
      <ul className="flex flex-col gap-3 p-5" aria-live="polite">
        {!hydrated ? null : orden.length === 0 ? (
          <li className="rounded-2xl bg-papel p-4 text-tinta-2">{t("vacio")}</li>
        ) : (
          orden.map((p) => {
            const estado = p.estado ?? "nuevo";
            const sig = siguienteEstadoLocatario(estado);
            const envio = p.tipo.toLowerCase().includes("env");
            return (
              <li key={p.id} className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-display text-2xl text-morado-700">{p.id}</span>
                    <span className="text-sm font-semibold">{p.cliente}</span>
                  </div>
                  <span className={cn("rounded-pill px-2.5 py-0.5 text-[12px] font-bold", COLOR[estado])}>{t(`estados.${estado}`)}</span>
                </div>
                <p>{p.items}</p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-tinta-2">
                  <span className="flex items-center gap-1">
                    {envio ? <Bike className="size-4" aria-hidden /> : <Store className="size-4" aria-hidden />}
                    {voc("entregas", p.tipo)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" aria-hidden />
                    {t("hora", { hora: p.hora })}
                  </span>
                  {p.folio && (
                    <span className="flex items-center gap-1 font-semibold text-morado">
                      <Smartphone className="size-4" aria-hidden />
                      {t("app")}
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-lg font-bold">{formatMXN(p.total, locale)}</span>
                  {estado !== "entregado" && (
                    <Button size="sm" onClick={() => avanzar(p.id)}>
                      {t(`acciones.${sig as Exclude<EstadoLocatario, "nuevo">}`)}
                    </Button>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
