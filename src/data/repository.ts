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
};

export interface Repository {
  mercados(filtro?: FiltroMercados): Promise<Mercado[]>;
  mercado(id: string): Promise<Mercado | null>;
  interior(mercadoId: string): Promise<Interior | null>;
  puesto(id: string): Promise<Puesto | null>;
  zonasHuerto(): Promise<ZonaHuerto[]>;
  productores(filtro?: FiltroProductores): Promise<Productor[]>;
  productor(id: string): Promise<Productor | null>;
  eventos(desde?: Date): Promise<Evento[]>;
  rutas(): Promise<Ruta[]>;
  resenas(objetivoId: string): Promise<Resena[]>;
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
