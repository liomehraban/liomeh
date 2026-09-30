"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Diálogo de confirmación para acciones que no se deshacen (canjear puntos, reiniciar la demo, bajar de plan).
 * Controlado: el padre decide cuándo se abre y qué pasa al confirmar.
 */
export function Confirmar({
  abierto,
  onCambio,
  titulo,
  texto,
  confirmar,
  onConfirmar,
  peligro = false,
  icono,
}: {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  titulo: string;
  texto: ReactNode;
  confirmar: string;
  onConfirmar: () => void;
  peligro?: boolean;
  icono?: ReactNode;
}) {
  const t = useTranslations("comun");
  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent closeLabel={t("cerrar")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icono}
            {titulo}
          </DialogTitle>
          <DialogDescription className="text-[15px] text-tinta-2">{texto}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onCambio(false)}>
            {t("cancelar")}
          </Button>
          <Button
            variant={peligro ? "destructive" : "default"}
            onClick={() => {
              onCambio(false);
              onConfirmar();
            }}
          >
            {confirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
