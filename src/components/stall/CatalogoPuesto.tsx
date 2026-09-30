"use client";

import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAgregarAlCarrito } from "@/components/cart/useAgregarAlCarrito";
import { useVocabulario } from "@/hooks/useVocabulario";
import { useRouter } from "@/i18n/navigation";
import { useAhora } from "@/hooks/useAhora";
import { huertoDeProducto } from "@/lib/carrito";
import { hoyCDMX } from "@/lib/eventos";
import { claveVenta, stockActual, unidadPlural, type Stock } from "@/lib/inventario";
import type { Puesto } from "@/lib/schemas";
import { catalogoEfectivo } from "@/lib/locatario";
import { cn } from "@/lib/utils";
import { demoSeed } from "@/data/demo-seed";
import type { PuestoResumen } from "@/data/comercio";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { Precio } from "./Precio";

const ESTILO_STOCK: Record<Stock["estado"], string> = {
  surtido: "text-nopal-700",
  ok: "text-tinta-2",
  pocas: "text-chile",
  agotado: "text-tinta-2",
};

/**
 * Catálogo con inventario vivo. Cada producto tiene un solo control: «Agregar» lo pone en el pedido y
 * se convierte en − cantidad + sobre el carrito (tope = lo disponible). Así nunca hay una cantidad
 * elegida que no esté en el carrito. Un pedido por puesto: si hay otro puesto en el carrito, pregunta.
 */
export function CatalogoPuesto({ puesto, nombresPuestos, vendedor }: { puesto: Puesto; nombresPuestos: Record<string, string>; vendedor?: PuestoResumen }) {
  const t = useTranslations("puesto");
  const voc = useVocabulario();
  const router = useRouter();
  const hydrated = useHydrated();
  const ahora = useAhora();
  // Si es el puesto de la demo, refleja lo que el locatario editó (precio, disponibilidad, productos nuevos).
  const esDemo = puesto.id === demoSeed.locatario.puesto_id;
  const extra = useAppStore((s) => s.locatario.catalogoExtra);
  const ediciones = useAppStore((s) => s.locatario.ediciones);
  const vendidos = useAppStore((s) => s.vendidos);
  const carrito = useAppStore((s) => s.carrito);
  const cambiarCantidad = useAppStore((s) => s.cambiarCantidad);
  const productos = esDemo && hydrated ? catalogoEfectivo(puesto.productos, extra, ediciones) : puesto.productos.map((x) => ({ ...x, disponible: true }));
  const { agregar, dialogo } = useAgregarAlCarrito(
    puesto.id,
    nombresPuestos,
    (item) => {
      toast.success(t("agregado", { qty: item.qty, producto: item.nombre }), {
        action: { label: t("verCarrito"), onClick: () => router.push("/carrito") },
      });
    },
    vendedor,
  );

  const enCarrito = (nombre: string) => carrito.find((l) => l.puestoId === puesto.id)?.items.find((i) => i.nombre === nombre)?.qty ?? 0;
  // El inventario depende de la hora: solo se calcula en el cliente (sin desajuste de hidratación).
  const stockDe = (prod: (typeof productos)[number]): Stock | null => {
    if (!ahora || !hydrated) return null;
    const dia = hoyCDMX(ahora);
    return stockActual(puesto.id, prod, ahora, {
      vendidosDemo: (vendidos[claveVenta(dia, puesto.id, prod.n)] ?? 0) + enCarrito(prod.n),
      pausado: !prod.disponible,
      protegido: puesto.real_segun_guia || esDemo,
    });
  };

  return (
    <>
      <ul data-revelar className="flex flex-col divide-y divide-border rounded-card border border-border bg-white">
        {productos.map((prod) => {
          const stock = stockDe(prod);
          const agotado = stock ? stock.disponible === 0 : !prod.disponible;
          const n = hydrated ? enCarrito(prod.n) : 0;
          // El stock ya descuenta lo que está en el carrito: se puede sumar mientras quede disponible.
          const puedeSumar = stock ? stock.disponible > 0 : n < 99;
          return (
            <li key={prod.n} data-demo={`producto:${prod.n}`} className={cn("flex flex-col gap-3 p-4", agotado && "bg-papel")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className={cn("font-semibold", agotado && "text-tinta-2")}>{prod.n}</span>
                  <span className="text-[13px] text-tinta-2">/ {voc("unidades", prod.u)}</span>
                  {stock && (
                    <span className={cn("text-[12px] font-semibold", ESTILO_STOCK[stock.estado])}>
                      {stock.estado === "agotado"
                        ? t("stock.agotado")
                        : stock.estado === "pocas"
                          ? t("stock.pocas", { n: stock.disponible, u: unidadPlural(prod.u, stock.disponible) })
                          : stock.estado === "surtido"
                            ? t("stock.surtido", { n: stock.disponible, u: unidadPlural(prod.u, stock.disponible) })
                            : t("stock.ok", { n: stock.disponible, u: unidadPlural(prod.u, stock.disponible) })}
                    </span>
                  )}
                </div>
                <Precio monto={prod.p} className="text-right" />
              </div>
              <div className="flex min-h-11 items-center justify-end gap-3">
                {n > 0 ? (
                  <>
                    <span className="mr-auto text-[13px] font-semibold text-nopal-700">{t("enTuPedido")}</span>
                    <div className="flex items-center rounded-pill border border-morado/40 bg-morado/5" role="group" aria-label={t("cantidad", { producto: prod.n })}>
                      <button
                        type="button"
                        aria-label={n > 1 ? t("menos") : t("quitarDelPedido", { producto: prod.n })}
                        onClick={() => cambiarCantidad(puesto.id, prod.n, n - 1)}
                        className="grid size-11 place-items-center rounded-pill text-morado"
                      >
                        {n > 1 ? <Minus className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                      </button>
                      <output className="w-8 text-center font-bold" aria-live="polite">
                        {n}
                      </output>
                      <button
                        type="button"
                        data-demo="mas"
                        aria-label={t("mas")}
                        disabled={!puedeSumar}
                        onClick={() => cambiarCantidad(puesto.id, prod.n, n + 1)}
                        className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/50"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                  </>
                ) : (
                  <Button
                    size="sm"
                    data-demo="agregar"
                    disabled={agotado}
                    onClick={() => agregar({ nombre: prod.n, precio: prod.p, unidad: prod.u, qty: 1, huertoId: huertoDeProducto(prod.n, puesto.origen) })}
                  >
                    <ShoppingBasket aria-hidden />
                    {agotado ? t("stock.agotadoBoton") : t("agregar")}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {dialogo}
    </>
  );
}
