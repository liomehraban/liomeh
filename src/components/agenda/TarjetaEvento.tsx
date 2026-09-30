"use client";

import { Bell, BellRing, CalendarDays, ChevronRight, MapPin, Navigation } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { etiquetaEvento, formatRangoFechas } from "@/lib/eventos";
import { comoLlegarUrl } from "@/lib/geo";
import { enIdioma } from "@/lib/idioma";
import type { Evento } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

const accion =
  "flex min-h-11 items-center gap-1.5 rounded-pill border px-3 text-[13px] font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

/** Tarjeta de evento: fechas, lugar, etiqueta de estado y acciones. */
export function TarjetaEvento({ e, ahora, mercadoExiste }: { e: Evento; ahora: Date; mercadoExiste: boolean }) {
  const t = useTranslations("agenda");
  const locale = useLocale();
  const titulo = enIdioma(e, "titulo", locale);
  const hydrated = useHydrated();
  const activo = useAppStore((s) => s.recordatorios.includes(e.id));
  const toggle = useAppStore((s) => s.toggleRecordatorio);
  const etiqueta = etiquetaEvento(e, ahora);

  const chip =
    etiqueta === "en curso"
      ? { txt: t("enCurso"), cls: "bg-nopal-700 text-white" }
      : etiqueta === "por confirmar"
        ? { txt: t("porConfirmar"), cls: "bg-cempasuchil text-morado-900" }
        : etiqueta === "siempre"
          ? { txt: t("siempre"), cls: "bg-anil text-white" }
          : { txt: t("proximo"), cls: "bg-morado-50 text-morado-700" };

  return (
    <article className="flex flex-col gap-2 rounded-card border border-border bg-white p-4" aria-labelledby={`ev-${e.id}`}>
      <span className={cn("w-fit rounded-pill px-2.5 py-0.5 text-[13px] font-bold", chip.cls)}>{chip.txt}</span>
      <h3 id={`ev-${e.id}`} className="text-lg leading-snug font-bold text-tinta">
        {titulo}
      </h3>
      {e.inicio !== "recurrente" && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-morado-700">
          <CalendarDays className="size-4" aria-hidden />
          {formatRangoFechas(e.inicio, e.fin, locale)}
        </p>
      )}
      {/* Con mercado en la app, el lugar es el enlace a su ficha (como en una app nativa): así las acciones caben en una fila. */}
      {e.mercado_id && mercadoExiste ? (
        <Link
          href={`/mercado/${e.mercado_id}`}
          aria-label={`${t("verMercado")}: ${e.lugar}`}
          // Área táctil de 44 px con relleno vertical compensado por margen negativo: ocupa en el flujo lo mismo que
          // el lugar en texto plano, así el aire hasta la descripción es igual en ambas variantes.
          className="relative -mx-1 -my-3 flex items-center gap-1.5 rounded-xl px-1 py-3 text-sm font-semibold text-morado hover:bg-morado-50"
        >
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">{e.lugar}</span>
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </Link>
      ) : (
        <p className="flex items-center gap-1.5 text-sm text-tinta-2">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {e.lugar}
        </p>
      )}
      <p className="text-sm text-tinta-2">{enIdioma(e, "descripcion", locale)}</p>
      <div className="grid grid-cols-1 gap-2 pt-1 min-[360px]:grid-cols-2">
        <button
          type="button"
          aria-pressed={hydrated && activo}
          onClick={() => {
            const on = toggle(e.id);
            if (on) toast.success(t("recordatorioCreado", { titulo }));
            else toast(t("recordatorioQuitado"));
          }}
          className={cn(accion, "justify-center", hydrated && activo ? "border-dorado bg-dorado text-morado-900" : "border-morado text-morado")}
        >
          {hydrated && activo ? <BellRing className="size-4" aria-hidden /> : <Bell className="size-4" aria-hidden />}
          {hydrated && activo ? t("recordando") : t("recordarme")}
        </button>
        <a href={comoLlegarUrl(e)} target="_blank" rel="noopener noreferrer" className={cn(accion, "justify-center border-border")}>
          <Navigation className="size-4" aria-hidden />
          {t("comoLlegar")}
        </a>
      </div>
    </article>
  );
}
