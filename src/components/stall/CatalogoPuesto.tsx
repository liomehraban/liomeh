"use client";

import { useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { useAgregarAlCarrito } from "@/components/cart/useAgregarAlCarrito";
import { useRouter } from "@/i18n/navigation";
import { huertoDeProducto } from "@/lib/carrito";
import type { Puesto } from "@/lib/schemas";
import { Precio } from "./Precio";

/** Catálogo con stepper de cantidad y «Agregar». Un pedido por puesto: si hay otro puesto en el carrito, pregunta. */
export function CatalogoPuesto({ puesto, nombresPuestos }: { puesto: Puesto; nombresPuestos: Record<string, string> }) {
  const t = useTranslations("puesto");
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const { agregar, dialogo } = useAgregarAlCarrito(puesto.id, nombresPuestos, (item) => {
    setQty((q) => ({ ...q, [item.nombre]: 1 }));
    toast.success(t("agregado", { qty: item.qty, producto: item.nombre }), {
      action: { label: t("verCarrito"), onClick: () => router.push("/carrito") },
    });
  });

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
                <Stepper
                  valor={n}
                  onCambio={(v) => setQty((q) => ({ ...q, [prod.n]: v }))}
                  etiqueta={t("cantidad", { producto: prod.n })}
                  menos={t("menos")}
                  mas={t("mas")}
                />
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => agregar({ nombre: prod.n, precio: prod.p, unidad: prod.u, qty: n, huertoId: huertoDeProducto(prod.n, puesto.origen) })}
                >
                  <ShoppingBasket aria-hidden />
                  {t("agregar")}
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
