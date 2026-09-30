/**
 * Stub del repositorio sobre Supabase (Postgres + PostGIS).
 * Esquema: supabase/migrations/0001_init.sql. Roadmap: docs/02_arquitectura.md › Roadmap de backend.
 * No se conecta en esta etapa: cada método lanza "not implemented".
 */
import type { Repository } from "./repository";

const notImplemented = (metodo: string): never => {
  throw new Error(`SupabaseRepository.${metodo}: not implemented`);
};

export class SupabaseRepository implements Repository {
  // TODO: select * from mercados where … (filtros → where alcaldia = any($1), destacado = $2)
  async mercados(): Promise<never> { return notImplemented("mercados"); }
  // TODO: select * from mercados where id = $1
  async mercado(): Promise<never> { return notImplemented("mercado"); }
  // TODO: armar Interior desde interiores + edificios + nodos + aristas + puestos + rutas_interior
  async interior(): Promise<never> { return notImplemented("interior"); }
  // TODO: select * from puestos where id = $1 (con productos)
  async puesto(): Promise<never> { return notImplemented("puesto"); }
  async puestosDeMercado(): Promise<never> { return notImplemented("puestosDeMercado"); }
  // TODO: select * from zonas_huerto (ST_AsGeoJSON del polígono)
  async zonasHuerto(): Promise<never> { return notImplemented("zonasHuerto"); }
  // TODO: select * from productores where zona_id = $1
  async productores(): Promise<never> { return notImplemented("productores"); }
  async productor(): Promise<never> { return notImplemented("productor"); }
  // TODO: select * from eventos where coalesce(fin, inicio) >= $1 order by inicio
  async eventos(): Promise<never> { return notImplemented("eventos"); }
  async rutas(): Promise<never> { return notImplemented("rutas"); }
  // TODO: select * from resenas where objetivo_id = $1 order by fecha desc
  async resenas(): Promise<never> { return notImplemented("resenas"); }
  async lealtad(): Promise<never> { return notImplemented("lealtad"); }
  // TODO: reemplazar por el perfil del usuario autenticado (auth OTP)
  async demo(): Promise<never> { return notImplemented("demo"); }
  // TODO: vistas materializadas del panel de gobierno
  async metricas(): Promise<never> { return notImplemented("metricas"); }
  async modeloNegocio(): Promise<never> { return notImplemented("modeloNegocio"); }
}
