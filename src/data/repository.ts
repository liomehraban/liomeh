/**
 * Único punto de acceso a datos (CLAUDE.md, regla 2).
 * Las pantallas llaman a getRepository(); nunca importan JSON directo.
 */
import type {
  Evento,
  Interior,
  Lealtad,
  Mercado,
  MetricasGobierno,
  ModeloNegocio,
  Productor,
  Puesto,
  Resena,
  Ruta,
  UsuariosDemo,
  ZonaHuerto,
} from "@/lib/schemas";
import type { Rating } from "@/lib/resenas";
import { MockRepository } from "./mock-repository";
import { SupabaseRepository } from "./supabase-repository";

export type FiltroMercados = {
  alcaldias?: string[];
  destacados?: boolean;
  tipos?: string[];
  ids?: string[];
};

export type FiltroProductores = {
  zonaId?: string;
  alcaldia?: string;
  ids?: string[];
};

/** Puesto real en línea (de un mercado con mapa interior) con su mercado. */
export type PuestoEnLinea = { puesto: Puesto; mercado: Mercado };

export interface Repository {
  mercados(filtro?: FiltroMercados): Promise<Mercado[]>;
  mercado(id: string): Promise<Mercado | null>;
  interior(mercadoId: string): Promise<Interior | null>;
  puesto(id: string): Promise<Puesto | null>;
  /** Puestos en línea de un mercado (interior o catálogo simulado). */
  puestosDeMercado(mercadoId: string): Promise<Puesto[]>;
  /** Puestos reales en línea (mercados con interior) con su mercado, en una sola consulta. */
  puestosEnLinea(): Promise<PuestoEnLinea[]>;
  /** Nombres únicos de los productos que vende cada mercado (para la búsqueda). */
  productosPorMercado(): Promise<Record<string, string[]>>;
  zonasHuerto(): Promise<ZonaHuerto[]>;
  productores(filtro?: FiltroProductores): Promise<Productor[]>;
  productor(id: string): Promise<Productor | null>;
  eventos(desde?: Date): Promise<Evento[]>;
  rutas(): Promise<Ruta[]>;
  resenas(objetivoId: string): Promise<Resena[]>;
  /** Promedio y total de reseñas por objetivo (agregado, sin traer las reseñas). */
  ratings(): Promise<Record<string, Rating>>;
  lealtad(): Promise<Lealtad>;
  demo(): Promise<UsuariosDemo>;
  metricas(): Promise<MetricasGobierno>;
  modeloNegocio(): Promise<ModeloNegocio>;
}

let instance: Repository | null = null;

export function getRepository(): Repository {
  instance ??= process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" ? new SupabaseRepository() : new MockRepository();
  return instance;
}
