"use client";

import { Bell, BellRing, CalendarDays, MapPin, Navigation, Play, ShoppingBasket, Sprout, Store } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { comoLlegarUrl } from "@/lib/geo";
import type { TarjetaResuelta } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

const ICONO = { mercado: MapPin, puesto: Store, productor: Sprout, evento: CalendarDays, ruta: Play } as const;
const accion =
  "flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

/** Tarjeta accionable: mercado → Ver/Cómo llegar · puesto → Llévame · productor → Comprar · evento → Recordarme · ruta → Iniciar. */
export function TarjetaAsistente({ c }: { c: TarjetaResuelta }) {
  const t = useTranslations("asistente");
  const hydrated = useHydrated();
  const recordando = useAppStore((s) => s.recordatorios.includes(c.id));
  const toggle = useAppStore((s) => s.toggleRecordatorio);
  const Icono = ICONO[c.tipo];

  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-3" aria-label={`${t(`tipos.${c.tipo}`)}: ${c.titulo}`}>
      <div className="flex items-start gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-morado-50 text-morado" aria-hidden>
          <Icono className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-bold tracking-wide text-tinta-2 uppercase">{t(`tipos.${c.tipo}`)}</span>
          <span className="leading-snug font-bold text-morado-700">{c.titulo}</span>
          {c.subtitulo && <span className="line-clamp-2 text-[13px] text-tinta-2">{c.subtitulo}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {c.tipo === "mercado" && (
          <>
            <Link href={`/mercado/${c.id}`} className={cn(accion, "bg-primary text-primary-foreground")}>
              {t("acciones.ver")}
            </Link>
            {c.lat !== undefined && c.lng !== undefined && (
              <a href={comoLlegarUrl({ lat: c.lat, lng: c.lng })} target="_blank" rel="noopener noreferrer" className={cn(accion, "border border-morado text-morado")}>
                <Navigation className="size-4" aria-hidden />
                {t("acciones.comoLlegar")}
              </a>
            )}
          </>
        )}
        {c.tipo === "puesto" && c.mercadoId && (
          <Link href={`/mercado/${c.mercadoId}/interior?puesto=${c.id}&desde=metro-merced`} className={cn(accion, "bg-primary text-primary-foreground")}>
            <Navigation className="size-4" aria-hidden />
            {t("acciones.llevame")}
          </Link>
        )}
        {c.tipo === "productor" && (
          <Link href={`/huertos/${c.id}`} className={cn(accion, "bg-nopal-700 text-white")}>
            <ShoppingBasket className="size-4" aria-hidden />
            {t("acciones.comprar")}
          </Link>
        )}
        {c.tipo === "evento" && (
          <button
            type="button"
            aria-pressed={hydrated && recordando}
            onClick={() => toggle(c.id)}
            data-demo={`recordar:${c.id}`}
            className={cn(accion, hydrated && recordando ? "bg-dorado text-morado-900" : "border border-morado text-morado")}
          >
            {hydrated && recordando ? <BellRing className="size-4" aria-hidden /> : <Bell className="size-4" aria-hidden />}
            {hydrated && recordando ? t("acciones.recordando") : t("acciones.recordarme")}
          </button>
        )}
        {c.tipo === "ruta" && (
          <Link href={`/rutas/${c.id}`} className={cn(accion, "bg-primary text-primary-foreground")}>
            <Play className="size-4" aria-hidden />
            {t("acciones.iniciar")}
          </Link>
        )}
      </div>
    </article>
  );
}
