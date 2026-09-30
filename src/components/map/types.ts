import type { LatLng } from "@/lib/geo";

/** Punto genérico del mapa, independiente del proveedor. */
export type PuntoMapa = LatLng & {
  id: string;
  /** Color del anillo (hex): color del giro principal. */
  color: string;
  etiqueta?: string;
};

export type CapaPuntos = {
  tipo: "puntos";
  id: string;
  puntos: PuntoMapa[];
  /** Agrupa en clusters (se separan al hacer zoom; desde zoom 15 no hay clusters). */
  cluster?: boolean;
  estilo: "normal" | "destacado" | "productor" | "atenuado" | "relleno";
  /** false = solo decorativa (no responde a toques). Default true. */
  interactiva?: boolean;
};

/** Polígonos (anillos [lng, lat] ya cerrados). */
export type CapaZonas = {
  tipo: "zonas";
  id: string;
  zonas: { id: string; nombre: string; anillo: [number, number][] }[];
  color: string;
};

/** Recorrido: línea que une las paradas en orden + marcadores numerados. */
export type CapaRuta = {
  tipo: "ruta";
  id: string;
  puntos: PuntoMapa[];
  /** Ids de paradas ya visitadas (se pintan en verde). */
  hechas?: string[];
};

export type CapaMapa = CapaPuntos | CapaZonas | CapaRuta;

/** Movimiento de cámara pedido desde fuera; `key` distinto fuerza el movimiento aunque el destino se repita. */
export type Enfoque = LatLng & { zoom?: number; key: number };

/** Encuadre de una caja [minLng, minLat, maxLng, maxLat]; `key` distinto fuerza el movimiento. */
export type Encuadre = { bbox: [number, number, number, number]; key: number };

export type MapViewProps = {
  center: LatLng;
  zoom: number;
  layers: CapaMapa[];
  onSelect?: (id: string, capa: string) => void;
  seleccionado?: string | null;
  ubicacion?: LatLng | null;
  enfoque?: Enfoque | null;
  encuadre?: Encuadre | null;
  /** Padding inferior (px) para centrar lo seleccionado por encima de un bottom sheet. */
  paddingInferior?: number;
  ariaLabel: string;
  className?: string;
};

export const CLUSTER_MAX_ZOOM = 14;
