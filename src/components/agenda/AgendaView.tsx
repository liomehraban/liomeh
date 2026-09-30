"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, List } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { TarjetaRuta } from "@/components/rutas/TarjetaRuta";
import type { Parada } from "@/data/rutas";
import { useAhora } from "@/hooks/useAhora";
import { agruparPorMes, CATEGORIAS_AGENDA, categoriaAgenda, type CategoriaAgenda } from "@/lib/eventos";
import type { Evento, Ruta } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Calendario } from "./Calendario";
import { TarjetaEvento } from "./TarjetaEvento";
import { Esqueleto } from "@/components/motion/Esqueleto";

const chip =
  "flex h-11 shrink-0 items-center rounded-pill border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

/** M10 · Agenda cultural + M11 · Rutas (pestaña). */
export function AgendaView({ eventos, rutas, paradas, mercados }: { eventos: Evento[]; rutas: Ruta[]; paradas: Record<string, Parada>; mercados: string[] }) {
  const t = useTranslations("agenda");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const ahora = useAhora();
  const tab = params.get("tab") === "rutas" ? "rutas" : "eventos";
  const [vista, setVista] = useState<"lista" | "calendario">("lista");
  const [cats, setCats] = useState<CategoriaAgenda[]>([]);
  const setMercados = useMemo(() => new Set(mercados), [mercados]);

  const filtrados = useMemo(() => (cats.length ? eventos.filter((e) => cats.includes(categoriaAgenda(e.categoria))) : eventos), [eventos, cats]);
  const grupos = ahora ? agruparPorMes(filtrados, ahora) : null;
  const nombreMes = (clave: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${clave}-15T12:00:00Z`));

  return (
    <div className="flex flex-col">
      <header className="relative bg-morado px-5 pt-16 pb-5 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-4xl">{t("titulo")}</h1>
      </header>
      <Tabs value={tab} onValueChange={(v) => router.replace(v === "rutas" ? "/agenda?tab=rutas" : "/agenda", { scroll: false })} className="p-5">
        <TabsList className="w-full">
          <TabsTrigger value="eventos">{t("eventos")}</TabsTrigger>
          <TabsTrigger value="rutas">{t("rutas")}</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div role="radiogroup" aria-label={t("vista")} className="flex rounded-pill bg-morado-50 p-1">
              {(["lista", "calendario"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={vista === v}
                  onClick={() => setVista(v)}
                  className={cn("flex h-11 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold", vista === v ? "bg-primary text-primary-foreground" : "text-morado-700")}
                >
                  {v === "lista" ? <List className="size-4" aria-hidden /> : <CalendarDays className="size-4" aria-hidden />}
                  {t(v)}
                </button>
              ))}
            </div>
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
            {CATEGORIAS_AGENDA.map((c) => {
              const on = cats.includes(c);
              return (
                <button key={c} type="button" aria-pressed={on} onClick={() => setCats((x) => (on ? x.filter((y) => y !== c) : [...x, c]))} className={cn(chip, on ? "border-morado bg-morado text-crema" : "border-border bg-white")}>
                  {t(`filtros.${c}`)}
                </button>
              );
            })}
          </div>

          {!ahora || !grupos ? (
            <div className="flex flex-col gap-3">
              <Esqueleto className="h-8 w-48" />
              <Esqueleto className="h-52 rounded-card" />
              <Esqueleto className="h-52 rounded-card" />
            </div>
          ) : vista === "calendario" ? (
            <Calendario eventos={filtrados} ahora={ahora} mercados={setMercados} />
          ) : grupos.meses.length + grupos.siempre.length === 0 ? (
            <p className="rounded-2xl bg-papel p-4 text-tinta-2">{t("sinEventos")}</p>
          ) : (
            <>
              {grupos.meses.map(([mes, lista]) => (
                <section key={mes} data-revelar className="flex flex-col gap-3" aria-label={nombreMes(mes)}>
                  <h2 className="font-display text-3xl text-morado-700 capitalize">{nombreMes(mes)}</h2>
                  {lista.map((e) => (
                    <TarjetaEvento key={e.id} e={e} ahora={ahora} mercadoExiste={!!e.mercado_id && setMercados.has(e.mercado_id)} />
                  ))}
                </section>
              ))}
              {grupos.siempre.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2 className="font-display text-3xl text-morado-700">{t("siempre")}</h2>
                  {grupos.siempre.map((e) => (
                    <TarjetaEvento key={e.id} e={e} ahora={ahora} mercadoExiste={!!e.mercado_id && setMercados.has(e.mercado_id)} />
                  ))}
                </section>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="rutas" className="flex flex-col gap-3">
          {rutas.map((r) => (
            <TarjetaRuta key={r.id} r={r} paradas={paradas} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
