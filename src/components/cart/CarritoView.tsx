"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { MarchantaIlustracion } from "@/components/assistant/MarchantaIlustracion";
import { Button } from "@/components/ui/button";
import { useVocabulario } from "@/hooks/useVocabulario";
import { Link } from "@/i18n/navigation";
import { Precio } from "@/components/stall/Precio";
import type { PuestoResumen } from "@/data/comercio";
import { Esqueleto } from "@/components/motion/Esqueleto";
import { subtotalGrupo } from "@/lib/carrito";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoSimple } from "./EncabezadoSimple";
import { toast } from "sonner";
import { useAhora } from "@/hooks/useAhora";
import { hoyCDMX } from "@/lib/eventos";
import { claveVenta, stockActual } from "@/lib/inventario";

/** M5 · Carrito agrupado por puesto (un pedido por puesto). */
export function CarritoView({ puestos }: { puestos: Record<string, PuestoResumen> }) {
  const t = useTranslations("carrito");
  const voc = useVocabulario();
  const hydrated = useHydrated();
  const carrito = useAppStore((s) => s.carrito);
  const vendedores = useAppStore((s) => s.vendedores);
  const vendidos = useAppStore((s) => s.vendidos);
  const ahora = useAhora();
  const tp = useTranslations("puesto");
  /** Unidades que aún se pueden pedir (inventario vivo); `null` = sin límite (productores o sin hora). */
  const maximo = (puestoId: string, i: { nombre: string; precio: number; unidad: string; rescate?: unknown }) => {
    if (i.rescate) return 1; // lote de «Rescata hoy»: uno por oferta
    const v = puestos[puestoId] ?? vendedores[puestoId];
    if (!ahora || !v || v.tipo !== "puesto") return null;
    const dia = hoyCDMX(ahora);
    return stockActual(puestoId, { n: i.nombre, p: i.precio, u: i.unidad }, ahora, {
      vendidosDemo: vendidos[claveVenta(dia, puestoId, i.nombre)] ?? 0,
      protegido: !!v.stockProtegido,
    }).disponible;
  };
  const cambiar = useAppStore((s) => s.cambiarCantidad);
  const quitarGrupo = useAppStore((s) => s.quitarGrupo);

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoSimple titulo={t("titulo")} />
      {!hydrated ? (
        <div className="flex flex-col gap-3 p-5">
          <Esqueleto className="h-56 rounded-card" />
        </div>
      ) : carrito.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <MarchantaIlustracion className="w-36" />
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
                        <span className="text-[13px] text-tinta-2">/ {voc("unidades", i.unidad)}</span>
                      </div>
                      <div className="flex items-center rounded-pill border border-border">
                        <button type="button" aria-label={i.qty > 1 ? `−1 ${i.nombre}` : t("quitar", { producto: i.nombre })} onClick={() => cambiar(grupo.puestoId, i.nombre, i.qty - 1)} className="grid size-11 place-items-center text-morado">
                          {i.qty > 1 ? <Minus className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                        </button>
                        <output className="w-6 text-center font-bold">{i.qty}</output>
                        <button
                          type="button"
                          aria-label={`+1 ${i.nombre}`}
                          onClick={() => {
                            const max = maximo(grupo.puestoId, i);
                            if (max !== null && i.qty + 1 > max) return toast(tp("sinStock", { producto: i.nombre }));
                            cambiar(grupo.puestoId, i.nombre, i.qty + 1);
                          }}
                          className="grid size-11 place-items-center text-morado"
                        >
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
