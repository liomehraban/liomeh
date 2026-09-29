"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

import { cn } from "@/lib/utils";
import type { MapViewProps } from "../types";

/**
 * Stub funcional mínimo del proveedor Google (NEXT_PUBLIC_MAP_PROVIDER=google + NEXT_PUBLIC_GOOGLE_MAPS_KEY).
 * Pinta todos los puntos sin clusters. TODO: clusters (@googlemaps/markerclusterer), enfoque y ubicación.
 */
export default function GoogleView({ center, zoom, layers, onSelect, ariaLabel, className }: MapViewProps) {
  return (
    <div className={cn("relative h-full w-full", className)} role="region" aria-label={ariaLabel}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ""}>
        <Map defaultCenter={center} defaultZoom={zoom} disableDefaultUI gestureHandling="greedy">
          {layers.flatMap((capa) =>
            capa.puntos.map((p) => (
              <Marker key={`${capa.id}-${p.id}`} position={p} title={p.etiqueta} onClick={() => onSelect?.(p.id, capa.id)} />
            )),
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
