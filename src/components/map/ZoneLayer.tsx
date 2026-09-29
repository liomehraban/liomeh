"use client";

import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection, Polygon } from "geojson";

import type { CapaZonas } from "./types";

export function geojsonZonas(capa: CapaZonas): FeatureCollection<Polygon> {
  return {
    type: "FeatureCollection",
    features: capa.zonas.map((z) => ({
      type: "Feature",
      id: z.id,
      properties: { id: z.id, capa: capa.id, nombre: z.nombre },
      geometry: { type: "Polygon", coordinates: [z.anillo] },
    })),
  };
}

export const idsZonas = (capa: CapaZonas) => [`${capa.id}-relleno`];

/** Polígonos semitransparentes con contorno; el seleccionado se resalta. */
export function ZoneLayer({ capa, seleccionado }: { capa: CapaZonas; seleccionado?: string | null }) {
  const sel = seleccionado ?? "";
  return (
    <Source id={capa.id} type="geojson" data={geojsonZonas(capa)}>
      <Layer
        id={`${capa.id}-relleno`}
        type="fill"
        paint={{ "fill-color": capa.color, "fill-opacity": ["case", ["==", ["get", "id"], sel], 0.42, 0.24] }}
      />
      <Layer
        id={`${capa.id}-contorno`}
        type="line"
        paint={{ "line-color": capa.color, "line-width": ["case", ["==", ["get", "id"], sel], 3.5, 2], "line-dasharray": [2, 1] }}
      />
    </Source>
  );
}
