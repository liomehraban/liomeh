"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import type { MapViewProps } from "./types";

const usarGoogle = process.env.NEXT_PUBLIC_MAP_PROVIDER === "google" && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

const Proveedor = usarGoogle
  ? dynamic(() => import("./providers/google"), { ssr: false })
  : dynamic(() => import("./providers/maplibre"), { ssr: false });

/**
 * Mapa independiente del proveedor: MapLibre + CARTO por default, Google si se configura.
 * El motor del mapa (≈1 MB de JS) se monta cuando el navegador queda libre, para que la
 * pantalla pinte e hidrate primero; mientras, se ve el fondo del mapa.
 */
export function MapView(props: MapViewProps) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelar = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setListo(true), { timeout: 1500 });
    return () => cancelar(id);
  }, []);
  if (!listo) return <div className={cn("bg-[#F3EDE3]", props.className)} role="img" aria-label={props.ariaLabel} aria-busy />;
  return <Proveedor {...props} />;
}

export type { MapViewProps, CapaMapa, PuntoMapa, Enfoque, Encuadre } from "./types";
