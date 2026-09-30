"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EncabezadoPerfil } from "@/components/locatario/EncabezadoPerfil";
import { formatMXN } from "@/lib/money";
import { normalizarEstadoMayoreo, siguientesEstadosMayoreo, type EstadoMayoreo } from "@/lib/productor";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

const COLOR: Record<EstadoMayoreo, string> = {
  nuevo: "bg-cempasuchil text-morado-900",
  confirmado: "bg-morado-50 text-morado-700",
  listo: "bg-nopal text-white",
  enviado: "bg-anil text-white",
  entregado: "bg-gris/20 text-tinta-2",
};
const ORDEN: EstadoMayoreo[] = ["nuevo", "confirmado", "listo", "enviado", "entregado"];

/** M18 · Productor › Pedidos de mayoreo: Nuevo → Confirmado → Listo / Enviado con terceros → Entregado. */
export function PedidosMayoreoView() {
  const t = useTranslations("productor.pedidos");
  const locale = useLocale();
  const hydrated = useHydrated();
  const pedidos = useAppStore((s) => s.productor.pedidos);
  const cambiar = useAppStore((s) => s.cambiarEstadoMayoreo);
  const lista = [...pedidos]
    .map((p) => ({ ...p, e: p.estadoId ?? normalizarEstadoMayoreo(p.estado) }))
    .sort((a, b) => ORDEN.indexOf(a.e) - ORDEN.indexOf(b.e));

  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={t("titulo")} />
      <ul className="flex flex-col gap-3 p-5" aria-live="polite">
        {hydrated && lista.length === 0 && <li className="rounded-2xl bg-papel p-4 text-tinta-2">{t("vacio")}</li>}
        {hydrated &&
          lista.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-bold text-morado-700">{p.cliente}</span>
                  {p.folio && <span className="text-[12px] text-tinta-2">{p.folio}</span>}
                </div>
                <span className={cn("shrink-0 rounded-pill px-2.5 py-0.5 text-[12px] font-bold", COLOR[p.e])}>{t(`estados.${p.e}`)}</span>
              </div>
              <p className="text-sm">
                {p.producto} · {p.cantidad}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                <span className="text-lg font-bold">{formatMXN(p.total, locale)}</span>
                <div className="flex flex-wrap gap-2">
                  {siguientesEstadosMayoreo(p.e).map((sig) => (
                    <Button
                      key={sig}
                      size="sm"
                      variant={sig === "enviado" ? "secondary" : "default"}
                      onClick={() => {
                        cambiar(p.id!, sig);
                        toast(t("cambiado", { estado: t(`estados.${sig}`).toLowerCase() }));
                      }}
                    >
                      {t(`acciones.${sig as Exclude<EstadoMayoreo, "nuevo">}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
