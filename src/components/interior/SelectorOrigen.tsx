"use client";

import { Bus, TrainFront } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ORIGENES, type Origen } from "@/lib/interior";
import type { Interior } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function SelectorOrigen({
  interior,
  valor,
  onCambio,
  onConfirmar,
  onCancelar,
}: {
  interior: Interior;
  valor: Origen;
  onCambio: (o: Origen) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const t = useTranslations("interior");
  return (
    <section className="flex flex-col gap-3">
      <h2 id="origen" className="text-lg font-bold text-morado-700">
        {t("desdeDonde")}
      </h2>
      <div role="radiogroup" aria-labelledby="origen" className="flex flex-col gap-2">
        {ORIGENES.map((o) => {
          const acceso = interior.accesos.find((a) => a.id === o);
          const Icono = acceso?.tipo === "metro" ? TrainFront : Bus;
          const on = valor === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              data-demo={`origen-${o}`}
              onClick={() => onCambio(o)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                on ? "border-morado bg-morado-50 text-morado-700" : "border-border bg-white",
              )}
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full text-white"
                style={{ background: acceso?.tipo === "metro" ? "#E4007C" : "#1F4E9A" }}
                aria-hidden
              >
                <Icono className="size-4" />
              </span>
              {acceso?.nombre ?? o}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onCancelar}>
          {t("cancelar")}
        </Button>
        <Button className="flex-[1.4]" onClick={onConfirmar} data-demo="confirmar-origen">
          {t("calcular")}
        </Button>
      </div>
    </section>
  );
}
