"use client";

import { Store } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EncabezadoPerfil } from "@/components/locatario/EncabezadoPerfil";
import { useVocabulario } from "@/hooks/useVocabulario";
import { traducirCantidades } from "@/lib/idioma";
import { normalizarEstadoMayoreo, partirCliente, siguientesEstadosMayoreo, type EstadoMayoreo } from "@/lib/productor";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { Esqueleto } from "@/components/motion/Esqueleto";
import { Precio } from "@/components/stall/Precio";

/** Un solo estilo de insignia para todos los estados: fondo tenue, texto oscuro y filo del mismo tono. */
const COLOR: Record<EstadoMayoreo, string> = {
  nuevo: "bg-cempasuchil/15 text-morado-900 ring-cempasuchil/45",
  confirmado: "bg-morado/10 text-morado-700 ring-morado/25",
  listo: "bg-nopal/10 text-nopal-700 ring-nopal/30",
  enviado: "bg-anil/10 text-anil ring-anil/25",
  entregado: "bg-gris/10 text-tinta-2 ring-gris/30",
};
const ORDEN: EstadoMayoreo[] = ["nuevo", "confirmado", "listo", "enviado", "entregado"];

/** M18 · Productor › Pedidos de mayoreo: Nuevo → Confirmado → Listo / Enviado con terceros → Entregado. */
export function PedidosMayoreoView() {
  const t = useTranslations("productor.pedidos");
  const tp = useTranslations("productor");
  const voc = useVocabulario();
  const hydrated = useHydrated();
  const pedidos = useAppStore((s) => s.productor.pedidos);
  const cambiar = useAppStore((s) => s.cambiarEstadoMayoreo);
  const lista = [...pedidos]
    .map((p) => ({ ...p, e: p.estadoId ?? normalizarEstadoMayoreo(p.estado), c: partirCliente(p.cliente) }))
    .sort((a, b) => ORDEN.indexOf(a.e) - ORDEN.indexOf(b.e));

  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={t("titulo")} />
      <ul data-revelar className="flex flex-col gap-3 p-5" aria-live="polite">
        {!hydrated &&
          [0, 1].map((i) => (
            <li key={i}>
              <Esqueleto className="h-36 rounded-card" />
            </li>
          ))}
        {hydrated && lista.length === 0 && <li className="rounded-2xl bg-papel p-4 text-tinta-2">{t("vacio")}</li>}
        {hydrated &&
          lista.map((p) => (
            <motion.li layout transition={{ type: "spring", stiffness: 420, damping: 36 }} key={p.id} className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="text-base font-bold text-morado-700">{p.c.nombre}</span>
                  {/* Mercado y folio en un segundo renglón de datos, en vez de «(La Merced)» pegado al nombre. */}
                  {(p.c.mercado || p.folio) && (
                    <span className="flex flex-wrap items-center gap-x-1.5 text-[12px] text-tinta-2">
                      {p.c.mercado && (
                        <span className="flex items-center gap-1">
                          <Store className="size-3.5" aria-hidden />
                          {p.c.mercado}
                        </span>
                      )}
                      {p.c.mercado && p.folio && <span aria-hidden>·</span>}
                      {p.folio && <span className="tabular-nums">{p.folio}</span>}
                    </span>
                  )}
                </div>
                <motion.span
                  key={p.e}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className={cn("shrink-0 rounded-pill px-2.5 py-0.5 text-[12px] font-bold ring-1 ring-inset", COLOR[p.e])}
                >
                  {t(`estados.${p.e}`)}
                </motion.span>
              </div>
              <p className="text-sm">
                {p.producto} · {traducirCantidades(p.cantidad, (u) => voc("unidades", u))}
              </p>
              {/* Mismo esquema en todas las tarjetas: renglón de total y, debajo, las acciones (principal + texto). */}
              <div className="flex items-baseline justify-between gap-2 border-t border-border pt-2">
                <span className="text-[13px] text-tinta-2">{tp("total")}</span>
                <Precio monto={p.total} className="text-lg" />
              </div>
              {siguientesEstadosMayoreo(p.e).length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {siguientesEstadosMayoreo(p.e).map((sig, i) => (
                    <Button
                      key={sig}
                      size="sm"
                      variant={i === 0 ? "default" : "ghost"}
                      onClick={() => {
                        cambiar(p.id!, sig);
                        toast(t("cambiado", { estado: t(`estados.${sig}`).toLowerCase() }));
                      }}
                    >
                      {t(`acciones.${sig as Exclude<EstadoMayoreo, "nuevo">}`)}
                    </Button>
                  ))}
                </div>
              )}
            </motion.li>
          ))}
      </ul>
    </div>
  );
}
