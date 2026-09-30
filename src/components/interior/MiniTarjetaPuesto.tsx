"use client";

import { BadgeCheck, Navigation, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Estrellas } from "@/components/market/Estrellas";
import { categoriaGiro, COLOR_GIRO } from "@/lib/giros";
import type { Puesto } from "@/lib/schemas";

export function MiniTarjetaPuesto({ puesto, onLlevame, onCerrar }: { puesto: Puesto; onLlevame: () => void; onCerrar: () => void }) {
  const t = useTranslations("interior");
  const tc = useTranslations("comun");
  return (
    <section aria-label={puesto.nombre} className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: COLOR_GIRO[categoriaGiro(puesto.giro)] }} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="flex items-center gap-1.5 text-xl font-bold text-morado-700">
            {puesto.nombre}
            {puesto.real_segun_guia && <BadgeCheck className="size-5 shrink-0 text-dorado" aria-label={t("real")} />}
          </h2>
          <p className="text-sm text-tinta-2">{puesto.ubicacion_texto}</p>
          <Estrellas rating={puesto.rating} total={puesto.num_resenas} />
        </div>
        <button type="button" onClick={onCerrar} aria-label={tc("cerrar")} className="-mt-1 -mr-2 grid size-11 place-items-center rounded-pill text-tinta-2 hover:bg-morado-50">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="secondary" className="flex-1">
          <Link href={`/puesto/${puesto.id}`}>{t("verPuesto")}</Link>
        </Button>
        <Button className="flex-1" onClick={onLlevame} data-demo="llevame">
          <Navigation aria-hidden />
          {t("llevame")}
        </Button>
      </div>
    </section>
  );
}
