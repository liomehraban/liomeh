"use client";

import { useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { useAgregarAlCarrito } from "@/components/cart/useAgregarAlCarrito";
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
  agotado: "text-gris",
};

/**
 * Catálogo con inventario vivo, stepper de cantidad (tope = lo disponible) y «Agregar».
 * Un pedido por puesto: si hay otro puesto en el carrito, pregunta.
 */
export function CatalogoPuesto({ puesto, nombresPuestos, vendedor }: { puesto: Puesto; nombresPuestos: Record<string, string>; vendedor?: PuestoResumen }) {
  const t = useTranslations("puesto");
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const hydrated = useHydrated();
  const ahora = useAhora();
  // Si es el puesto de la demo, refleja lo que el locatario editó (precio, disponibilidad, productos nuevos).
  const esDemo = puesto.id === demoSeed.locatario.puesto_id;
  const extra = useAppStore((s) => s.locatario.catalogoExtra);
  const ediciones = useAppStore((s) => s.locatario.ediciones);
  const vendidos = useAppStore((s) => s.vendidos);
  const carrito = useAppStore((s) => s.carrito);
  const productos = esDemo && hydrated ? catalogoEfectivo(puesto.productos, extra, ediciones) : puesto.productos.map((x) => ({ ...x, disponible: true }));
  const { agregar, dialogo } = useAgregarAlCarrito(
    puesto.id,
    nombresPuestos,
    (item) => {
      setQty((q) => ({ ...q, [item.nombre]: 1 }));
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
      <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-white">
        {productos.map((prod) => {
          const stock = stockDe(prod);
          const agotado = stock ? stock.disponible === 0 : !prod.disponible;
          const tope = stock ? Math.max(1, stock.disponible) : 99;
          const n = Math.min(qty[prod.n] ?? 1, tope);
          return (
            <li key={prod.n} data-demo={`producto:${prod.n}`} className={cn("flex flex-col gap-3 p-4", agotado && "bg-papel")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className={cn("font-semibold", agotado && "text-tinta-2")}>{prod.n}</span>
                  <span className="text-[13px] text-tinta-2">/ {prod.u}</span>
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
              <div className="flex items-center gap-3">
                <Stepper
                  valor={n}
                  max={tope}
                  onCambio={(v) => setQty((q) => ({ ...q, [prod.n]: v }))}
                  etiqueta={t("cantidad", { producto: prod.n })}
                  menos={t("menos")}
                  mas={t("mas")}
                />
                <Button
                  size="sm"
                  className="ml-auto"
                  data-demo="agregar"
                  disabled={agotado}
                  onClick={() => agregar({ nombre: prod.n, precio: prod.p, unidad: prod.u, qty: n, huertoId: huertoDeProducto(prod.n, puesto.origen) })}
                >
                  <ShoppingBasket aria-hidden />
                  {agotado ? t("stock.agotadoBoton") : t("agregar")}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {dialogo}
    </>
  );
}
