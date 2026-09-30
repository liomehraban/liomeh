"use client";

import { useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { useAgregarAlCarrito } from "@/components/cart/useAgregarAlCarrito";
import { Precio } from "@/components/stall/Precio";
import { useVocabulario } from "@/hooks/useVocabulario";
import { useRouter } from "@/i18n/navigation";
import { nombreMayoreo } from "@/lib/huertos";
import type { Productor } from "@/lib/schemas";
import { minimoMayoreo } from "@/lib/huertos";

/** Compra al mayoreo del producto principal (precio_mayoreo_app). Lleva huertoId → puntos dobles. */
export function ComprarMayoreo({ p, nombres }: { p: Productor; nombres: Record<string, string> }) {
  const t = useTranslations("productor");
  const tp = useTranslations("puesto");
  const router = useRouter();
  const v = useVocabulario();
  const { unidad, precio } = p.precio_mayoreo_app;
  const minimo = minimoMayoreo(p.venta_minima, unidad);
  const [qty, setQty] = useState(minimo);
  const { agregar, dialogo } = useAgregarAlCarrito(p.id, nombres, (item) => {
    setQty(minimo);
    toast.success(t("agregado", { qty: item.qty, unidad: v("unidades", unidad), producto: p.producto_principal }), {
      action: { label: t("verCarrito"), onClick: () => router.push("/carrito") },
    });
  });

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-semibold">{p.producto_principal}</span>
          <span className="text-[13px] text-tinta-2">/ {v("unidades", unidad)}</span>
        </div>
        <Precio monto={precio} className="text-right text-lg" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Stepper valor={qty} min={minimo} onCambio={setQty} etiqueta={t("cantidad", { unidad: v("unidades", unidad) })} menos={tp("menos")} mas={tp("mas")} />
        <Button className="min-w-fit flex-1 basis-40 whitespace-nowrap" onClick={() => agregar({ nombre: nombreMayoreo(p), precio, unidad, qty, huertoId: p.id })}>
          <ShoppingBasket aria-hidden />
          {t("agregar")}
        </Button>
      </div>
      <p className="text-[13px] font-semibold text-nopal-700">{t("comprarTexto")}</p>
      {dialogo}
    </div>
  );
}
