"use client";

import { Clock, Fish, Flower2, Palette, SlidersHorizontal, Star, Truck, Utensils, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { CHIPS, type Chip } from "@/lib/filtros";
import { HEX_GIRO } from "@/lib/giros";
import { cn } from "@/lib/utils";

const ICONO: Record<Chip, LucideIcon> = {
  abierto: Clock,
  destacados: Star,
  comida: Utensils,
  flores: Flower2,
  artesanias: Palette,
  pescados: Fish,
  mayoreo: Truck,
};
const COLOR: Partial<Record<Chip, string>> = {
  abierto: "#3C8D2F",
  destacados: "#F2B01E",
  comida: HEX_GIRO.comida,
  flores: HEX_GIRO.flores,
  artesanias: HEX_GIRO.artesanias,
  pescados: HEX_GIRO.pescados,
  mayoreo: HEX_GIRO.mayoreo,
};

const base =
  "flex h-11 shrink-0 items-center gap-1.5 rounded-pill border px-3.5 text-sm font-semibold whitespace-nowrap shadow-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

export function ChipsFiltro({
  activos,
  onToggle,
  onFiltros,
  nFiltros,
}: {
  activos: Chip[];
  onToggle: (c: Chip) => void;
  onFiltros: () => void;
  nFiltros: number;
}) {
  const t = useTranslations("explorar");
  return (
    <div className="-mx-4 fila-chips gap-2 px-4 pb-1">
      <button type="button" onClick={onFiltros} className={cn(base, "border-morado bg-white text-morado", nFiltros > 0 && "bg-morado text-crema")}>
        <SlidersHorizontal className="size-4" aria-hidden />
        {t("filtros")}
        {nFiltros > 0 && <span className="grid min-w-5 place-items-center rounded-pill bg-dorado px-1 text-xs text-morado-900">{nFiltros}</span>}
      </button>
      {CHIPS.map((c) => {
        const on = activos.includes(c);
        const Icono = ICONO[c];
        return (
          <button
            key={c}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(c)}
            className={cn(base, on ? "border-morado bg-morado text-crema" : "border-border bg-white text-tinta")}
          >
            <Icono className="size-4" style={{ color: on ? undefined : COLOR[c] }} aria-hidden />
            {t(`chips.${c}`)}
          </button>
        );
      })}
    </div>
  );
}
