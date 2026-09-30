"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Download, Info, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { alcaldiasPorVentas, csvMetricas, toneladasRescatadas } from "@/lib/gobierno";
import { formatCompacto, formatMXN } from "@/lib/money";
import type { MetricasGobierno } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { GraficaBarras } from "./GraficaBarras";
import { GraficaLinea } from "./GraficaLinea";
import { KpiTile } from "./KpiTile";
import { MapaAdopcion } from "./MapaAdopcion";
import { etiquetaMes } from "./mes";
import { BarraGobierno } from "./BarraGobierno";

const SECRETARIAS = ["sectur", "sedema", "se"] as const;
type Secretaria = (typeof SECRETARIAS)[number];
const ETIQUETA: Record<Secretaria, string> = { sectur: "SECTUR", sedema: "SEDEMA", se: "SE" };

/** Contenedor común del encabezado y el cuerpo: mismo ancho máximo y mismos márgenes laterales. */
const CONTENEDOR = "mx-auto w-full max-w-6xl px-5 lg:px-10";

/** Pestaña inicial desde el hash (#sedema), para el modo presentación. */
const subHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const leerHash = (): Secretaria | null => {
  const h = window.location.hash.slice(1) as Secretaria;
  return SECRETARIAS.includes(h) ? h : null;
};

type Props = {
  metricas: MetricasGobierno;
  nombres: Record<string, string>;
  mercados: { id: string; nombre: string; alcaldia: string; lat: number; lng: number }[];
};

/** M19 · Panel de impacto para SECTUR, SEDEMA y SE. Todas las cifras salen de metricas_gobierno.json. */
export function PanelGobierno({ metricas: m, nombres, mercados }: Props) {
  const t = useTranslations("gobierno");
  const locale = useLocale();
  const hydrated = useHydrated();
  const rescates = useAppStore((s) => s.rescates);
  const hash = useSyncExternalStore(subHash, leerHash, () => null);
  const [elegida, setElegida] = useState<Secretaria | null>(null);
  const tab = elegida ?? hash ?? "sectur";

  const k = m.kpis_hoy;
  const nf = (n: number, max = 0) => new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: max }).format(n);
  const compacto = (n: number) => formatCompacto(n, locale);
  const mxnCompacto = (n: number) => `$${formatCompacto(n, locale)}`;
  const kgDemo = hydrated ? rescates.reduce((s, r) => s + r.kg, 0) : 0;
  const rescatadas = toneladasRescatadas(k.alimento_rescatado_mes_ton, kgDemo);

  const serie = useMemo(() => m.serie_mensual.map((s) => ({ ...s, etiqueta: etiquetaMes(s.mes, locale) })), [m.serie_mensual, locale]);
  const ventas = alcaldiasPorVentas(m.por_alcaldia).slice(0, 8);
  const visitas = [...m.por_alcaldia].sort((a, b) => b.visitas_turistas_mes - a.visitas_turistas_mes).slice(0, 8);
  const pctApp = Math.round((k.mercados_en_app / k.mercados_totales) * 100);
  const ultimoMes = m.serie_mensual.find((s) => s.usuarios_activos === k.usuarios_activos_mes) ?? m.serie_mensual.at(-1)!;
  // Mes de los KPI dentro del escenario de 12 meses: las gráficas lo marcan como «Hoy».
  const indiceHoy = m.serie_mensual.indexOf(ultimoMes);
  const pctExtranjeros = Math.round((ultimoMes.turistas_extranjeros / ultimoMes.usuarios_activos) * 1000) / 10;

  const exportar = () => {
    const blob = new Blob([csvMetricas(m, nombres, kgDemo)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "bara-bara-impacto.csv" });
    // Safari y Firefox solo descargan si el enlace está en el documento; la URL se libera después.
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(t("exportado"));
  };

  return (
    <div className="flex flex-col pb-28">
      <BarraGobierno heroId="gobierno-hero" titulo={t("titulo")} />
      <header id="gobierno-hero" className="relative bg-morado pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        {/* Mismo contenedor (ancho y márgenes) que el cuerpo: el encabezado y las tarjetas quedan alineados. */}
        <div className={cn(CONTENEDOR, "relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between")}>
          <div className="min-w-0">
            <h1 className="font-display text-4xl leading-none lg:text-5xl">{t("titulo")}</h1>
            <p className="mt-1 text-crema/90">{t("subtitulo")}</p>
            {/* Las secretarías son un rótulo, no botones: texto plano separado por puntos. */}
            <p className="mt-2 text-[13px] font-bold tracking-wide text-crema/90">
              {SECRETARIAS.map((s) => ETIQUETA[s]).join(" · ")}
            </p>
          </div>
          <Button onClick={exportar} variant="secondary" className="w-fit border-white bg-white text-morado hover:bg-crema">
            <Download aria-hidden />
            {t("exportar")}
          </Button>
        </div>
      </header>

      <div className={cn(CONTENEDOR, "flex flex-col gap-5 py-5")}>
        <p className="flex items-center gap-2 rounded-2xl bg-dorado-200 px-4 py-2 text-[13px] font-semibold text-morado-900" role="note">
          <Info className="size-4 shrink-0" aria-hidden />
          {t("simulados")}
        </p>

        <section aria-label={t("general")} className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiTile etiqueta={t("kpis.mercados_en_app")} numero={k.mercados_en_app} formato={nf} detalle={t("kpis.mercados_de", { total: nf(k.mercados_totales), pct: pctApp })} />
          <KpiTile etiqueta={t("kpis.usuarios_activos_mes")} numero={k.usuarios_activos_mes} formato={compacto} detalle={nf(k.usuarios_activos_mes)} />
          <KpiTile etiqueta={t("kpis.derrama_digital_mes_mxn")} numero={k.derrama_digital_mes_mxn} formato={mxnCompacto} detalle={formatMXN(k.derrama_digital_mes_mxn, locale)} />
          <KpiTile etiqueta={t("kpis.transacciones_mes")} numero={k.transacciones_mes} formato={compacto} detalle={nf(k.transacciones_mes)} />
          <KpiTile etiqueta={t("kpis.rating_promedio")} numero={k.rating_promedio} formato={(n) => `${nf(n, 1)} ★`} className="col-span-2 lg:col-span-1" />
        </section>

        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
          <MapaAdopcion mercados={mercados} porAlcaldia={m.por_alcaldia} />
          <div className="flex min-w-0 flex-col gap-5">
            <GraficaLinea
              titulo={t("serie.gmv")}
              subtitulo={t("serie.texto")}
              datos={serie}
              x="etiqueta"
              encabezadoX={t("serie.mes")} hoy={indiceHoy}
              series={[{ clave: "gmv_mxn", nombre: t("serie.gmv"), color: "#9B2694" }]}
              formato={mxnCompacto}
              className="flex-1"
            />
            <GraficaLinea
              titulo={t("serie.usuarios")}
              subtitulo={t("serie.texto")}
              datos={serie}
              x="etiqueta"
              encabezadoX={t("serie.mes")} hoy={indiceHoy}
              series={[{ clave: "usuarios_activos", nombre: t("serie.usuarios"), color: "#9B2694" }]}
              formato={compacto}
              className="flex-1"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <GraficaBarras titulo={t("ventas.titulo")} subtitulo={t("ventas.texto")} encabezado={t("adopcion.alcaldia")} datos={ventas.map((a) => ({ nombre: a.alcaldia, valor: a.ventas_mes_mxn }))} formato={mxnCompacto} />
          <section aria-labelledby="top" className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
            <h2 id="top" className="font-bold text-morado-700">
              {t("top.titulo")}
            </h2>
            <ol data-revelar className="flex flex-1 flex-col justify-between">
              {m.top_mercados.map((x, i) => (
                <li key={x.id} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-morado-50 font-bold text-morado-700">{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="font-semibold">{nombres[x.id] ?? x.id}</span>
                    <span className="shrink-0 text-[13px] text-tinta-2">{t("top.visitas", { n: compacto(x.visitas_mes) })}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <Tabs value={tab} onValueChange={(v) => setElegida(v as Secretaria)} className="gap-4">
          <h2 className="font-display text-3xl text-morado-700">{t("secretarias")}</h2>
          {/* En desktop, segmentos de igual ancho (grid de 3 columnas 1fr) con aire alrededor del texto. */}
          <TabsList className="w-full lg:grid lg:w-fit lg:grid-cols-3">
            {SECRETARIAS.map((s) => (
              <TabsTrigger key={s} value={s} className="min-h-11 lg:min-w-28 lg:px-6" data-demo={`tab-${s}`}>
                {ETIQUETA[s]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="sectur" className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiTile etiqueta={t("kpis.turistas_mes")} numero={k.turistas_mes} formato={compacto} detalle={nf(k.turistas_mes)} />
              <KpiTile etiqueta={t("kpis.extranjeros")} numero={pctExtranjeros} formato={(n) => t("pct", { n: nf(n, 1) })} detalle={t("kpis.extranjerosTexto", { n: nf(ultimoMes.turistas_extranjeros), total: nf(ultimoMes.usuarios_activos) })} />
              <div className="col-span-2 flex items-center gap-3 rounded-card border border-dashed border-morado/30 bg-papel p-4">
                <Languages className="size-6 shrink-0 text-morado/60" aria-hidden />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-tinta">{t("sectur.idiomas")}</span>
                  <span className="text-[13px] text-tinta-2">{t("sectur.sinDato")}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <GraficaLinea className="h-full" titulo={t("sectur.turistas")} datos={serie} x="etiqueta" encabezadoX={t("serie.mes")} hoy={indiceHoy} series={[{ clave: "turistas_extranjeros", nombre: t("sectur.turistas"), color: "#1F4E9A" }]} formato={compacto} />
              <GraficaBarras titulo={t("sectur.visitas")} encabezado={t("adopcion.alcaldia")} color="#1F4E9A" datos={visitas.map((a) => ({ nombre: a.alcaldia, valor: a.visitas_turistas_mes }))} formato={compacto} />
            </div>
          </TabsContent>

          <TabsContent value="sedema" className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiTile etiqueta={t("kpis.co2_evitado_mes_ton")} numero={k.co2_evitado_mes_ton} formato={(n) => t("ton", { n: nf(n) })} />
              <KpiTile
                etiqueta={t("kpis.alimento_rescatado_mes_ton")}
                numero={rescatadas} formato={(n) => t("ton", { n: nf(n, kgDemo ? 3 : 0) })}
                detalle={kgDemo ? t("sedema.demo", { kg: nf(kgDemo, 1) }) : t("sedema.sinDemo")}
              />
              <KpiTile etiqueta={t("kpis.productores_suelo_conservacion")} numero={k.productores_suelo_conservacion} formato={nf} />
              <KpiTile etiqueta={t("kpis.km_intermediacion_evitados_mes")} numero={k.km_intermediacion_evitados_mes} formato={(n) => t("km", { n: compacto(n) })} />
            </div>
            <GraficaLinea
              titulo={t("sedema.serie")}
              subtitulo={t("serie.texto")}
              datos={serie}
              x="etiqueta"
              encabezadoX={t("serie.mes")} hoy={indiceHoy}
              series={[
                { clave: "co2_evitado_ton", nombre: t("sedema.co2"), color: "#3C8D2F" },
                { clave: "alimento_rescatado_ton", nombre: t("sedema.alimento"), color: "#1F4E9A" },
              ]}
              formato={(n) => t("ton", { n: nf(n) })}
            />
          </TabsContent>

          <TabsContent value="se" className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiTile etiqueta={t("kpis.derrama_digital_mes_mxn")} numero={k.derrama_digital_mes_mxn} formato={mxnCompacto} detalle={formatMXN(k.derrama_digital_mes_mxn, locale)} />
              <KpiTile etiqueta={t("kpis.locatarios_activos")} numero={k.locatarios_activos} formato={nf} />
              <KpiTile etiqueta={t("kpis.pct_ventas_efectivo_registradas")} numero={k.pct_ventas_efectivo_registradas} formato={(n) => t("pct", { n })} className="col-span-2" detalle={t("se.creditoTexto", { pct: k.pct_ventas_efectivo_registradas })} />
            </div>
            <GraficaLinea titulo={t("se.checkins")} subtitulo={t("se.credito")} datos={serie} x="etiqueta" encabezadoX={t("serie.mes")} hoy={indiceHoy} series={[{ clave: "checkins_efectivo", nombre: t("se.checkins"), color: "#9B2694" }]} formato={compacto} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
