"use client";

import { Layer, Marker, Source } from "react-map-gl/maplibre";

import { cn } from "@/lib/utils";
import type { CapaRuta } from "./types";

/** Línea punteada entre paradas y marcadores numerados (HTML: no depende de glifos del estilo). */
export function RouteLayer({ capa, onSelect }: { capa: CapaRuta; onSelect?: (id: string, capa: string) => void }) {
  const hechas = new Set(capa.hechas ?? []);
  return (
    <>
      <Source id={capa.id} type="geojson" data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: capa.puntos.map((p) => [p.lng, p.lat]) } }}>
        <Layer id={`${capa.id}-linea`} type="line" layout={{ "line-cap": "round", "line-join": "round" }} paint={{ "line-color": "#9B2694", "line-width": 4, "line-dasharray": [1.5, 1.5] }} />
      </Source>
      {capa.puntos.map((p, i) => (
        <Marker key={p.id} latitude={p.lat} longitude={p.lng} anchor="center">
          <button
            type="button"
            onClick={() => onSelect?.(p.id, capa.id)}
            aria-label={`${i + 1}. ${p.etiqueta ?? p.id}`}
            className={cn(
              "grid size-9 place-items-center rounded-full border-[3px] border-white text-sm font-bold shadow-md",
              hechas.has(p.id) ? "bg-nopal-700 text-white" : i === 0 ? "bg-dorado text-morado-900" : "bg-morado text-crema",
            )}
          >
            {i + 1}
          </button>
        </Marker>
      ))}
    </>
  );
}
