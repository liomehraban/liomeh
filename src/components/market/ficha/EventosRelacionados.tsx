"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useAhora } from "@/hooks/useAhora";
import { estadoEvento, eventosVigentes, formatRangoFechas } from "@/lib/eventos";
import type { Evento } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Seccion } from "./Seccion";

/** Eventos vigentes del mercado (se filtran en el cliente con la fecha real). */
export function EventosRelacionados({ eventos }: { eventos: Evento[] }) {
  const t = useTranslations("mercado");
  const locale = useLocale();
  const now = useAhora();
  if (!now) return null;
  const vigentes = eventosVigentes(eventos, now);
  if (!vigentes.length) return null;
  return (
    <Seccion titulo={t("eventos")}>
      <ul className="flex flex-col gap-3">
        {vigentes.map((e) => {
          const estado = estadoEvento(e, now);
          const etiqueta = estado === "siempre" ? t("siempre") : !e.fecha_confirmada ? t("porConfirmar") : estado === "en curso" ? t("enCurso") : t("proximo");
          return (
            <li key={e.id} className="flex flex-col gap-1.5 rounded-card border border-border bg-white p-4">
              <span
                className={cn(
                  "w-fit rounded-pill px-2.5 py-0.5 text-[13px] font-semibold",
                  estado === "en curso" ? "bg-nopal text-white" : !e.fecha_confirmada ? "bg-cempasuchil text-morado-900" : "bg-morado-50 text-morado-700",
                )}
              >
                {etiqueta}
              </span>
              <h3 className="font-bold text-tinta">{e.titulo}</h3>
              {e.inicio !== "recurrente" && (
                <p className="flex items-center gap-1.5 text-sm text-tinta-2">
                  <CalendarDays className="size-4" aria-hidden />
                  {formatRangoFechas(e.inicio, e.fin, locale)}
                </p>
              )}
              <p className="flex items-center gap-1.5 text-sm text-tinta-2">
                <MapPin className="size-4" aria-hidden />
                {e.lugar}
              </p>
            </li>
          );
        })}
      </ul>
    </Seccion>
  );
}
