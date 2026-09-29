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
  if (instance) return instance;
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseRepository } = require("./supabase-repository") as typeof import("./supabase-repository");
    instance = new SupabaseRepository();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MockRepository } = require("./mock-repository") as typeof import("./mock-repository");
    instance = new MockRepository();
  }
  return instance;
}
