import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Resena } from "@/lib/schemas";

/** Lista de reseñas del JSON (M8 completa llega en la Fase 5). */
export function ListaResenas({ resenas, max = 3, vacio }: { resenas: Resena[]; max?: number; vacio: string }) {
  const t = useTranslations();
  if (!resenas.length) return <p className="rounded-2xl bg-papel p-4 text-tinta-2">{vacio}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {resenas.slice(0, max).map((r) => (
        <li key={r.id} className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">
              {r.autor} <span className="font-normal text-tinta-2">· {r.origen}</span>
            </span>
            <span className="text-dorado" aria-label={t("explorar.calificacion", { rating: r.estrellas })}>
              {"★".repeat(r.estrellas)}
              <span className="text-gris/40">{"★".repeat(5 - r.estrellas)}</span>
            </span>
          </div>
          <p lang={r.idioma}>{r.texto}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-nopal">
            <BadgeCheck className="size-4" aria-hidden />
            {r.verificada === "compra" ? t("mercado.verificadaCompra") : t("mercado.verificadaCheckin")}
          </p>
        </li>
      ))}
    </ul>
  );
}
