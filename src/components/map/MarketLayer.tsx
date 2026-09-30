"use client";

import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection, Point } from "geojson";

import { CLUSTER_MAX_ZOOM, type CapaPuntos } from "./types";

export function geojsonDe(capa: CapaPuntos): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: capa.puntos.map((p) => ({
      type: "Feature",
      id: p.id,
      properties: { id: p.id, color: p.color, capa: capa.id },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}

/** Ids de capas interactivas que genera una capa de puntos. */
export const idsInteractivos = (capa: CapaPuntos) =>
  capa.interactiva === false ? [] : [`${capa.id}-puntos`, ...(capa.cluster ? [`${capa.id}-clusters`] : [])];

const ESTILO = {
  normal: { fill: "#FEFAEB", r: 6.5, rSel: 11, stroke: 3, opacidad: 1 },
  destacado: { fill: "#F2B01E", r: 10, rSel: 14, stroke: 4, opacidad: 1 },
  productor: { fill: "#3C8D2F", r: 9, rSel: 13, stroke: 3, opacidad: 1 },
  atenuado: { fill: "#FEFAEB", r: 4.5, rSel: 4.5, stroke: 2, opacidad: 0.55 },
  /** Coropleta por punto: el color va de relleno con anillo blanco (panel de gobierno). */
  relleno: { fill: ["get", "color"], r: 6, rSel: 9, stroke: 1.5, opacidad: 1, anillo: "#FFFFFF" },
} as const satisfies Record<string, { fill: string | unknown[]; r: number; rSel: number; stroke: number; opacidad: number; anillo?: string }>;

/** Pines de mercados: clusters morados; pin crema con anillo del giro, o dorado más grande si es destacado. */
export function MarketLayer({ capa, seleccionado, conGlifos }: { capa: CapaPuntos; seleccionado?: string | null; conGlifos: boolean }) {
  const e: { fill: string | unknown[]; r: number; rSel: number; stroke: number; opacidad: number; anillo?: string } = ESTILO[capa.estilo];
  const sel = seleccionado ?? "";
  return (
    <Source
      id={capa.id}
      type="geojson"
      data={geojsonDe(capa)}
      cluster={capa.cluster}
      clusterRadius={50}
      clusterMaxZoom={CLUSTER_MAX_ZOOM}
    >
      {capa.cluster && (
        <Layer
          id={`${capa.id}-clusters`}
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": "#9B2694",
            "circle-opacity": e.opacidad,
            "circle-stroke-opacity": e.opacidad,
            "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 40, 26],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#FEFAEB",
          }}
        />
      )}
      {capa.cluster && conGlifos && (
        <Layer
          id={`${capa.id}-conteo`}
          type="symbol"
          filter={["has", "point_count"]}
          layout={{ "text-field": ["get", "point_count_abbreviated"], "text-font": ["Montserrat Medium"], "text-size": 13, "text-allow-overlap": true }}
          paint={{ "text-color": "#FEFAEB", "text-opacity": e.opacidad }}
        />
      )}
      <Layer
        id={`${capa.id}-puntos`}
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-color": e.fill as string,
          "circle-radius": ["case", ["==", ["get", "id"], sel], e.rSel, e.r],
          "circle-stroke-width": e.stroke,
          "circle-stroke-color": e.anillo ?? ["get", "color"],
          "circle-opacity": e.opacidad,
          "circle-stroke-opacity": e.opacidad,
        }}
      />
      <Layer
        id={`${capa.id}-seleccion`}
        type="circle"
        filter={["==", ["get", "id"], sel]}
        paint={{
          "circle-color": "transparent",
          "circle-radius": e.rSel + 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#3E1C3C",
        }}
      />
    </Source>
  );
}
