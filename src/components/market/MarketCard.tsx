"use client";

import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatDistance } from "@/lib/geo";
import type { CategoriaGiro } from "@/lib/giros";
import type { Horario } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { EstadoHorario } from "./EstadoHorario";
import { Estrellas } from "./Estrellas";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export type MarketCardData = {
  id: string;
  nombre: string;
  lema?: string;
  categoria: CategoriaGiro;
  horario?: Horario;
  distancia?: number;
  rating?: { promedio: number; total: number } | null;
};

/** Tarjeta de mercado: placeholder 16:9 + nombre en Bebas + lema + estado + distancia + rating. */
export function MarketCard({ m, className, onClick }: { m: MarketCardData; className?: string; onClick?: () => void }) {
  const locale = useLocale();
  return (
    <Link
      href={`/mercado/${m.id}`}
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-card border border-border bg-white p-2 pb-3 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <PhotoPlaceholder categoria={m.categoria} className="rounded-2xl" iconClassName="size-8" />
      <div className="flex flex-col gap-1 px-1">
        <h3 className="line-clamp-2 font-display text-2xl text-morado-700">{m.nombre}</h3>
        {m.lema && <p className="line-clamp-1 text-sm text-tinta-2">{m.lema}</p>}
        <EstadoHorario horario={m.horario} corto />
        <div className="flex items-center gap-3 text-sm text-tinta-2">
          {m.distancia !== undefined && <span>{formatDistance(m.distancia, locale)}</span>}
          {m.rating && <Estrellas rating={m.rating.promedio} />}
        </div>
      </div>
    </Link>
  );
}
