import { getTranslations } from "next-intl/server";
import { Hammer } from "lucide-react";

import { PhotoPlaceholder } from "@/components/market/PhotoPlaceholder";
import type { CategoriaGiro } from "@/lib/giros";
import type messages from "../../../messages/es.json";

export type ClavePagina = keyof typeof messages.paginas;
export type Fase = keyof typeof messages.fases;

/** Página provisional: se reemplaza por el módulo real en su fase. */
export async function Proximamente({
  pagina,
  fase,
  categoria = "otros",
  sinEncabezado = false,
}: {
  pagina: ClavePagina;
  fase: Fase;
  categoria?: CategoriaGiro;
  sinEncabezado?: boolean;
}) {
  const t = await getTranslations();
  return (
    <div className="flex min-h-full flex-col">
      {!sinEncabezado && (
        <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
          <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
          <h1 className="font-display text-4xl">{t(`paginas.${pagina}`)}</h1>
        </header>
      )}
      <div className="flex flex-1 flex-col gap-5 p-5">
        {!sinEncabezado && <PhotoPlaceholder categoria={categoria} />}
        <div className="flex items-start gap-3 rounded-card bg-morado-50 p-4">
          <Hammer className="mt-0.5 size-5 shrink-0 text-morado" aria-hidden />
          <div>
            <p className="font-semibold text-morado-700">{t("comun.proximamente")}</p>
            <p className="text-tinta-2">{t("comun.enConstruccion", { fase: t(`fases.${fase}`) })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
