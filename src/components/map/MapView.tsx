"use client";

import dynamic from "next/dynamic";

import type { MapViewProps } from "./types";

const usarGoogle = process.env.NEXT_PUBLIC_MAP_PROVIDER === "google" && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

const Proveedor = usarGoogle
  ? dynamic(() => import("./providers/google"), { ssr: false })
  : dynamic(() => import("./providers/maplibre"), { ssr: false });

/** Mapa independiente del proveedor: MapLibre + CARTO por default, Google si se configura. */
export function MapView(props: MapViewProps) {
  return <Proveedor {...props} />;
}

export type { MapViewProps, CapaMapa, PuntoMapa, Enfoque, Encuadre } from "./types";
