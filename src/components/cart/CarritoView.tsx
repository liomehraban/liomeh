"use client";

import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Precio } from "@/components/stall/Precio";
import type { PuestoResumen } from "@/data/comercio";
import { subtotalGrupo } from "@/lib/carrito";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoSimple } from "./EncabezadoSimple";

/** M5 · Carrito agrupado por puesto (un pedido por puesto). */
export function CarritoView({ puestos }: { puestos: Record<string, PuestoResumen> }) {
  const t = useTranslations("carrito");
  const hydrated = useHydrated();
  const carrito = useAppStore((s) => s.carrito);
  const vendedores = useAppStore((s) => s.vendedores);
  const cambiar = useAppStore((s) => s.cambiarCantidad);
  const quitarGrupo = useAppStore((s) => s.quitarGrupo);

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoSimple titulo={t("titulo")} />
      {!hydrated ? null : carrito.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <ShoppingBasket className="size-12 text-morado" strokeWidth={1.5} aria-hidden />
          <h2 className="text-xl font-bold text-morado-700">{t("vacio")}</h2>
          <p className="text-tinta-2">{t("vacioTexto")}</p>
          <Button asChild>
            <Link href="/explorar">{t("explorar")}</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-5">
          {carrito.length > 1 && <p className="rounded-2xl bg-morado-50 p-3 text-sm text-tinta-2">{t("variosPedidos")}</p>}
          {carrito.map((grupo) => {
            const p = puestos[grupo.puestoId] ?? vendedores[grupo.puestoId];
            const nombre = p?.nombre ?? grupo.puestoId;
            return (
              <section key={grupo.puestoId} aria-label={t("pedidoDe", { puesto: nombre })} className="flex flex-col gap-3 rounded-card border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-morado-700">{nombre}</h2>
                    {p && <p className="text-[13px] text-tinta-2">{t("enMercado", { mercado: p.mercadoNombre })}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarGrupo(grupo.puestoId)}
                    aria-label={t("vaciarGrupo", { puesto: nombre })}
                    className="grid size-11 shrink-0 place-items-center rounded-pill text-tinta-2 hover:bg-morado-50"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </div>
                <ul className="flex flex-col divide-y divide-border">
                  {grupo.items.map((i) => (
                    <li key={i.nombre} className="flex items-center gap-3 py-2">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-semibold">{i.nombre}</span>
                        <span className="text-[13px] text-tinta-2">/ {i.unidad}</span>
                      </div>
                      <div className="flex items-center rounded-pill border border-border">
                        <button type="button" aria-label={i.qty > 1 ? `−1 ${i.nombre}` : t("quitar", { producto: i.nombre })} onClick={() => cambiar(grupo.puestoId, i.nombre, i.qty - 1)} className="grid size-11 place-items-center text-morado">
                          {i.qty > 1 ? <Minus className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                        </button>
                        <output className="w-6 text-center font-bold">{i.qty}</output>
                        <button type="button" aria-label={`+1 ${i.nombre}`} onClick={() => cambiar(grupo.puestoId, i.nombre, i.qty + 1)} className="grid size-11 place-items-center text-morado">
                          <Plus className="size-4" aria-hidden />
                        </button>
                      </div>
                      <Precio monto={i.precio * i.qty} className="w-16 text-right" />
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="font-semibold">{t("subtotal")}</span>
                  <Precio monto={subtotalGrupo(grupo)} className="text-right text-lg" />
                </div>
                <Button asChild>
                  <Link href={`/checkout?puesto=${grupo.puestoId}`}>{t("pagarEste")}</Link>
                </Button>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
