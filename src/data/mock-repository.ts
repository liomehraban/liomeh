import mercadosJson from "../../data/mercados.json";
import interiorJson from "../../data/la_merced_interior.json";
import huertosJson from "../../data/huertos.json";
import eventosJson from "../../data/eventos.json";
import rutasJson from "../../data/rutas_experiencias.json";
import lealtadJson from "../../data/lealtad.json";
import resenasJson from "../../data/resenas.json";
import demoJson from "../../data/usuarios_demo.json";
import metricasJson from "../../data/metricas_gobierno.json";
import modeloJson from "../../data/modelo_negocio.json";

import * as S from "@/lib/schemas";
import type { FiltroMercados, FiltroProductores, Repository } from "./repository";

type Datos = {
  mercados: S.Mercado[];
  interior: S.Interior;
  huertos: { zonas: S.ZonaHuerto[]; productores: S.Productor[] };
  eventos: S.Evento[];
  rutas: S.Ruta[];
  lealtad: S.Lealtad;
  resenas: S.Resena[];
  demo: S.UsuariosDemo;
  metricas: S.MetricasGobierno;
  modelo: S.ModeloNegocio;
};

let cache: Datos | null = null;

/** Valida los JSON con zod una sola vez por proceso y los deja en memoria. */
export function datosMock(): Datos {
  if (cache) return cache;
  cache = {
    mercados: S.Mercados.parse(mercadosJson),
    interior: S.Interior.parse(interiorJson),
    huertos: S.Huertos.parse(huertosJson),
    eventos: S.Eventos.parse(eventosJson),
    rutas: S.Rutas.parse(rutasJson),
    lealtad: S.Lealtad.parse(lealtadJson),
    resenas: S.Resenas.parse(resenasJson),
    demo: S.UsuariosDemo.parse(demoJson),
    metricas: S.MetricasGobierno.parse(metricasJson),
    modelo: S.ModeloNegocio.parse(modeloJson),
  };
  return cache;
}

/** Fecha ISO (YYYY-MM-DD) en CDMX, para comparar con los eventos. */
const isoCDMX = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

export class MockRepository implements Repository {
  private get d() {
    return datosMock();
  }

  async mercados(f: FiltroMercados = {}) {
    return this.d.mercados.filter(
      (m) =>
        (!f.alcaldias?.length || f.alcaldias.includes(m.alcaldia)) &&
        (f.destacados === undefined || m.destacado === f.destacados) &&
        (!f.tipos?.length || m.tipos.some((t) => f.tipos!.includes(t))) &&
        (!f.ids?.length || f.ids.includes(m.id)),
    );
  }

  async mercado(id: string) {
    return this.d.mercados.find((m) => m.id === id) ?? null;
  }

  async interior(mercadoId: string) {
    return this.d.interior.mercado_id === mercadoId ? this.d.interior : null;
  }

  async puesto(id: string) {
    return this.d.interior.puestos.find((p) => p.id === id) ?? null;
  }

  async zonasHuerto() {
    return this.d.huertos.zonas;
  }

  async productores(f: FiltroProductores = {}) {
    return this.d.huertos.productores.filter(
      (p) => (!f.zonaId || p.zona_id === f.zonaId) && (!f.alcaldia || p.alcaldia === f.alcaldia),
    );
  }

  async productor(id: string) {
    return this.d.huertos.productores.find((p) => p.id === id) ?? null;
  }

  /** Recurrentes + los que no han terminado desde `desde`, ordenados por inicio. */
  async eventos(desde?: Date) {
    if (!desde) return this.d.eventos;
    const hoy = isoCDMX(desde);
    return this.d.eventos
      .filter((e) => e.inicio === "recurrente" || (e.fin ?? e.inicio) >= hoy)
      .sort((a, b) => (a.inicio === "recurrente" ? 1 : b.inicio === "recurrente" ? -1 : a.inicio.localeCompare(b.inicio)));
  }

  async rutas() {
    return this.d.rutas;
  }

  async resenas(objetivoId: string) {
    return this.d.resenas.filter((r) => r.objetivo_id === objetivoId);
  }

  async lealtad() {
    return this.d.lealtad;
  }

  async demo() {
    return this.d.demo;
  }

  async metricas() {
    return this.d.metricas;
  }

  async modeloNegocio() {
    return this.d.modelo;
  }
}
