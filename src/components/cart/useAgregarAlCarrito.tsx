"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { requiereNuevoPedido, type ItemCarrito } from "@/lib/carrito";
import { useAppStore } from "@/store/useAppStore";
import type { PuestoResumen } from "@/data/comercio";

/**
 * Agrega al carrito respetando «un pedido por vendedor»: si ya hay productos de otro,
 * pregunta antes de abrir otro pedido. Devuelve la función y el diálogo a renderizar.
 */
export function useAgregarAlCarrito(
  vendedorId: string,
  nombres: Record<string, string>,
  onAgregado: (item: ItemCarrito) => void,
  /** Ficha del vendedor para carrito/pedidos (necesaria en los puestos del catálogo simulado). */
  vendedor?: PuestoResumen,
) {
  const t = useTranslations("puesto");
  const agregar = useAppStore((s) => s.agregarAlCarrito);
  const carrito = useAppStore((s) => s.carrito);
  const vendedores = useAppStore((s) => s.vendedores);
  const [pendiente, setPendiente] = useState<ItemCarrito | null>(null);

  const confirmar = (item: ItemCarrito) => {
    agregar(vendedorId, item, vendedor);
    onAgregado(item);
  };
  const solicitar = (item: ItemCarrito) => (requiereNuevoPedido(carrito, vendedorId) ? setPendiente(item) : confirmar(item));
  const otro = carrito.find((l) => l.puestoId !== vendedorId);

  const dialogo = (
    <Dialog open={!!pendiente} onOpenChange={(v) => !v && setPendiente(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("otroPedidoTitulo")}</DialogTitle>
          <DialogDescription>{t("otroPedidoTexto", { puesto: otro ? (nombres[otro.puestoId] ?? vendedores[otro.puestoId]?.nombre ?? otro.puestoId) : "" })}</DialogDescription>
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
  );

  return { agregar: solicitar, dialogo };
}
