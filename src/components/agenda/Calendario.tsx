"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { celdasMes, eventosDelDia, hoyCDMX } from "@/lib/eventos";
import type { Evento } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { TarjetaEvento } from "./TarjetaEvento";

/** Vista de calendario mensual (lunes primero). */
export function Calendario({ eventos, ahora, mercados }: { eventos: Evento[]; ahora: Date; mercados: Set<string> }) {
  const t = useTranslations("agenda");
  const locale = useLocale();
  const hoy = hoyCDMX(ahora);
  const [mes, setMes] = useState(() => ({ anio: Number(hoy.slice(0, 4)), m: Number(hoy.slice(5, 7)) - 1 }));
  const [dia, setDia] = useState<string>(hoy);
  const loc = locale === "en" ? "en-US" : "es-MX";
  const tituloRaw = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(mes.anio, mes.m, 15)));
  const titulo = tituloRaw.charAt(0).toUpperCase() + tituloRaw.slice(1);
  const semana = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(loc, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 9, 5 + i))));
  const mover = (d: number) => setMes(({ anio, m }) => ({ anio: anio + Math.floor((m + d) / 12), m: (((m + d) % 12) + 12) % 12 }));
  const delDia = eventosDelDia(eventos, dia);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-border bg-white p-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => mover(-1)} aria-label={t("mesAnterior")} className="grid size-11 place-items-center rounded-pill text-morado hover:bg-morado-50">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <h3 className="font-bold" aria-live="polite">
            {titulo}
          </h3>
          <button type="button" onClick={() => mover(1)} aria-label={t("mesSiguiente")} className="grid size-11 place-items-center rounded-pill text-morado hover:bg-morado-50">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[12px] font-bold text-tinta-2" aria-hidden>
          {semana.map((d, i) => (
            <span key={i} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {celdasMes(mes.anio, mes.m).map((c, i) => {
            if (!c) return <span key={`v${i}`} />;
            const n = eventosDelDia(eventos, c).length;
            const esHoy = c === hoy;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setDia(c)}
                aria-pressed={dia === c}
                aria-label={`${new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${c}T12:00:00Z`))}${n ? ` · ${n}` : ""}`}
                className={cn(
                  "relative flex h-11 flex-col items-center justify-center rounded-xl text-sm",
                  dia === c ? "bg-morado text-crema" : esHoy ? "border border-morado text-morado" : "hover:bg-morado-50",
                  c < hoy && dia !== c && "text-gris",
                )}
              >
                {Number(c.slice(8))}
                {n > 0 && <span className={cn("absolute bottom-1 size-1.5 rounded-full", dia === c ? "bg-dorado" : "bg-rosa")} aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
      <h3 className="font-bold text-morado-700">
        {t("eventosDia", { dia: new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${dia}T12:00:00Z`)) })}
      </h3>
      {delDia.length ? (
        delDia.map((e) => <TarjetaEvento key={e.id} e={e} ahora={ahora} mercadoExiste={!!e.mercado_id && mercados.has(e.mercado_id)} />)
      ) : (
        <p className="rounded-2xl bg-papel p-4 text-tinta-2">{t("sinEventosDia")}</p>
      )}
    </div>
  );
}
