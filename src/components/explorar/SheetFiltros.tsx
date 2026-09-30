"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TIPO_KEY, TIPOS } from "@/components/market/tipos";
import type { FiltrosMapa } from "@/lib/filtros";
import { cn } from "@/lib/utils";

const chip =
  "min-h-11 rounded-pill border px-3.5 text-sm font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

export function SheetFiltros({
  abierto,
  onAbierto,
  filtros,
  onCambio,
  alcaldias,
  resultados,
}: {
  abierto: boolean;
  onAbierto: (v: boolean) => void;
  filtros: FiltrosMapa;
  onCambio: (f: FiltrosMapa) => void;
  alcaldias: string[];
  resultados: number;
}) {
  const t = useTranslations();
  const toggle = (lista: string[], v: string) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  return (
    <Sheet open={abierto} onOpenChange={onAbierto}>
      <SheetContent side="bottom" closeLabel={t("comun.cerrar")} className="max-h-[88%]">
        <SheetHeader>
          <SheetTitle>{t("explorar.filtrosTitulo")}</SheetTitle>
          <SheetDescription>{t("explorar.conteo", { n: resultados })}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 overflow-y-auto px-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold text-morado-700">{t("explorar.alcaldia")}</legend>
            <div className="flex flex-wrap gap-2">
              {alcaldias.map((a) => {
                const on = filtros.alcaldias.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onCambio({ ...filtros, alcaldias: toggle(filtros.alcaldias, a) })}
                    className={cn(chip, on ? "border-morado bg-morado text-crema" : "border-border bg-white")}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold text-morado-700">{t("explorar.tipo")}</legend>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((tipo) => {
                const on = filtros.tipos.includes(tipo);
                return (
                  <button
                    key={tipo}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onCambio({ ...filtros, tipos: toggle(filtros.tipos, tipo) })}
                    className={cn(chip, on ? "border-morado bg-morado text-crema" : "border-border bg-white")}
                  >
                    {t(`tipos.${TIPO_KEY[tipo]}`)}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <SheetFooter className="flex-row flex-wrap border-t border-border">
          <Button variant="ghost" className="grow basis-0 min-w-fit whitespace-nowrap" onClick={() => onCambio({ ...filtros, alcaldias: [], tipos: [] })}>
            {t("explorar.limpiarFiltros")}
          </Button>
          <Button className="grow-[2] basis-0 min-w-fit whitespace-nowrap" onClick={() => onAbierto(false)} disabled={!resultados}>
            {t("explorar.verN", { n: resultados })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
