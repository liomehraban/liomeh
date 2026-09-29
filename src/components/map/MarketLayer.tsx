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
export const idsInteractivos = (capa: CapaPuntos) => [`${capa.id}-puntos`, ...(capa.cluster ? [`${capa.id}-clusters`] : [])];

/** Pines de mercados: clusters morados; pin crema con anillo del giro, o dorado más grande si es destacado. */
export function MarketLayer({ capa, seleccionado, conGlifos }: { capa: CapaPuntos; seleccionado?: string | null; conGlifos: boolean }) {
  const destacado = capa.estilo === "destacado";
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
            "circle-color": "#93408F",
            "circle-opacity": 0.9,
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
          paint={{ "text-color": "#FEFAEB" }}
        />
      )}
      <Layer
        id={`${capa.id}-puntos`}
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-color": destacado ? "#C8A96A" : "#FEFAEB",
          "circle-radius": ["case", ["==", ["get", "id"], sel], destacado ? 14 : 11, destacado ? 10 : 6.5],
          "circle-stroke-width": destacado ? 4 : 3,
          "circle-stroke-color": ["get", "color"],
        }}
      />
      <Layer
        id={`${capa.id}-seleccion`}
        type="circle"
        filter={["==", ["get", "id"], sel]}
        paint={{
          "circle-color": "transparent",
          "circle-radius": destacado ? 20 : 17,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#3E1C3C",
        }}
      />
    </Source>
  );
}
