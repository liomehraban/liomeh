"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";

import { MapView, type CapaMapa } from "@/components/map/MapView";
import { RAMPA_ADOPCION, adopcion, claveAlcaldia, colorAdopcion, mapaAdopcion } from "@/lib/gobierno";
import type { MetricasGobierno } from "@/lib/schemas";

type MercadoPunto = { id: string; nombre: string; alcaldia: string; lat: number; lng: number };

/** Mapa de adopción: cada mercado toma el color (rampa secuencial morada) de la adopción de su alcaldía. */
export function MapaAdopcion({ mercados, porAlcaldia }: { mercados: MercadoPunto[]; porAlcaldia: MetricasGobierno["por_alcaldia"] }) {
  const t = useTranslations("gobierno.adopcion");
  const locale = useLocale();
  const capas = useMemo<CapaMapa[]>(() => {
    const mapa = mapaAdopcion(porAlcaldia);
    return [
      {
        tipo: "puntos",
        id: "adopcion",
        estilo: "relleno",
        interactiva: false,
        puntos: mercados.map((m) => ({ id: m.id, lat: m.lat, lng: m.lng, etiqueta: m.nombre, color: colorAdopcion(mapa.get(claveAlcaldia(m.alcaldia)) ?? 0) })),
      },
    ];
  }, [mercados, porAlcaldia]);
  const pct = (n: number) => new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { style: "percent", maximumFractionDigits: 0 }).format(n);
  const ordenadas = [...porAlcaldia].sort((a, b) => adopcion(b) - adopcion(a));

  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-white p-4">
      <figcaption className="flex flex-col">
        <span className="font-bold text-morado-700">{t("titulo")}</span>
        <span className="text-[12px] text-tinta-2">{t("texto")}</span>
      </figcaption>
      <div className="h-72 overflow-hidden rounded-2xl lg:h-auto lg:min-h-96 lg:flex-1">
        <MapView center={{ lat: 19.36, lng: -99.13 }} zoom={9.6} layers={capas} ariaLabel={t("aria")} className="size-full" cooperativo />
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-tinta-2">
        {RAMPA_ADOPCION.map((c, i) => (
          <li key={c} className="flex items-center gap-1.5">
            <span className="size-3 rounded-full border border-white shadow-[0_0_0_1px_#EADFE8]" style={{ background: c }} aria-hidden />
            {t(`p${i}` as "p0")}
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{t("titulo")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("alcaldia")}</th>
            <th scope="col">{t("activos")}</th>
            <th scope="col">{t("pctCol")}</th>
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((a) => (
            <tr key={a.alcaldia}>
              <th scope="row">{a.alcaldia}</th>
              <td>
                {a.mercados_activos_en_app}/{a.mercados}
              </td>
              <td>{pct(adopcion(a))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
