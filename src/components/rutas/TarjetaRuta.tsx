import { Clock, Lock, Route } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { Parada } from "@/data/rutas";
import type { Ruta } from "@/lib/schemas";
import { MiniMapaRuta } from "./MiniMapaRuta";

export function TarjetaRuta({ r, paradas }: { r: Ruta; paradas: Record<string, Parada> }) {
  const t = useTranslations("rutas");
  const pts = r.paradas.map((id) => paradas[id]).filter(Boolean);
  return (
    <Link
      href={`/rutas/${r.id}`}
      className="flex gap-3 rounded-card border border-border bg-white p-3 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <MiniMapaRuta puntos={pts} className="h-[84px] w-[120px] shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          {r.tipo === "premium" ? (
            <span className="flex items-center gap-1 rounded-pill bg-dorado px-2 py-0.5 text-[11px] font-bold text-morado-900">
              <Lock className="size-3" aria-hidden />
              {t("premium")}
            </span>
          ) : (
            <span className="rounded-pill bg-nopal/15 px-2 py-0.5 text-[11px] font-bold text-nopal">{t("gratis")}</span>
          )}
        </div>
        <h3 className="leading-snug font-bold text-morado-700">{r.titulo}</h3>
        <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-tinta-2">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {t("horas", { h: r.duracion_h })}
          </span>
          <span className="flex items-center gap-1">
            <Route className="size-3.5" aria-hidden />
            {t("km", { km: r.km })}
          </span>
          <span>{t("paradas", { n: r.paradas.length })}</span>
        </p>
      </div>
    </Link>
  );
}
