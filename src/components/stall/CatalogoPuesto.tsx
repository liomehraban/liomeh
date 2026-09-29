"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";
import { requiereNuevoPedido, type ItemCarrito } from "@/lib/carrito";
import type { Puesto } from "@/lib/schemas";
import { useAppStore } from "@/store/useAppStore";
import { Precio } from "./Precio";

/** Catálogo con stepper de cantidad y «Agregar». Un pedido por puesto: si hay otro puesto en el carrito, pregunta. */
export function CatalogoPuesto({ puesto, nombresPuestos }: { puesto: Puesto; nombresPuestos: Record<string, string> }) {
  const t = useTranslations("puesto");
  const router = useRouter();
  const agregar = useAppStore((s) => s.agregarAlCarrito);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [pendiente, setPendiente] = useState<ItemCarrito | null>(null);

  const huertoDe = (nombre: string) =>
    puesto.origen?.find((o) => o.huerto_id && nombre.toLowerCase().includes(o.producto.toLowerCase()))?.huerto_id ?? undefined;

  const confirmar = (item: ItemCarrito) => {
    agregar(puesto.id, item);
    setQty((q) => ({ ...q, [item.nombre]: 1 }));
    toast.success(t("agregado", { qty: item.qty, producto: item.nombre }), {
      action: { label: t("verCarrito"), onClick: () => router.push("/carrito") },
    });
  };

  const onAgregar = (item: ItemCarrito) => {
    if (requiereNuevoPedido(useAppStore.getState().carrito, puesto.id)) setPendiente(item);
    else confirmar(item);
  };

  const otro = useAppStore.getState().carrito.find((l) => l.puestoId !== puesto.id);

  return (
    <>
      <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-white">
        {puesto.productos.map((prod) => {
          const n = qty[prod.n] ?? 1;
          return (
            <li key={prod.n} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold">{prod.n}</span>
                  <span className="text-[13px] text-tinta-2">/ {prod.u}</span>
                </div>
                <Precio monto={prod.p} className="text-right" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-pill border border-border" role="group" aria-label={t("cantidad", { producto: prod.n })}>
                  <button
                    type="button"
                    aria-label={t("menos")}
                    disabled={n <= 1}
                    onClick={() => setQty((q) => ({ ...q, [prod.n]: Math.max(1, n - 1) }))}
                    className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/50"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <output className="w-8 text-center font-bold" aria-live="polite">
                    {n}
                  </output>
                  <button
                    type="button"
                    aria-label={t("mas")}
                    onClick={() => setQty((q) => ({ ...q, [prod.n]: Math.min(99, n + 1) }))}
                    className="grid size-11 place-items-center rounded-pill text-morado"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => onAgregar({ nombre: prod.n, precio: prod.p, unidad: prod.u, qty: n, huertoId: huertoDe(prod.n) })}
                >
                  <ShoppingBasket aria-hidden />
                  {t("agregar")}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!pendiente} onOpenChange={(v) => !v && setPendiente(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("otroPedidoTitulo")}</DialogTitle>
            <DialogDescription>{t("otroPedidoTexto", { puesto: otro ? (nombresPuestos[otro.puestoId] ?? otro.puestoId) : "" })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendiente(null)}>
              {t("otroPedidoNo")}
            </Button>
            <Button
              onClick={() => {
                if (pendiente) confirmar(pendiente);
                setPendiente(null);
              }}
            >
              {t("otroPedidoSi")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
