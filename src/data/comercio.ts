/** Datos de apoyo para carrito, checkout y pedidos (vía repositorio). */
import { getRepository } from "./repository";
import { demoSeed } from "./demo-seed";

/** Vendedor del carrito: un puesto de mercado o un productor (mayoreo directo del huerto). */
export type PuestoResumen = {
  id: string;
  tipo: "puesto" | "productor";
  /** Cómo se recoge (productores: «Recoger en centro de acopio»…). */
  recogida?: string;
  nombre: string;
  plan: "Gratis" | "Pro" | "Plus";
  giro: string;
  ubicacion: string;
  mercadoId: string;
  mercadoNombre: string;
  lat: number;
  lng: number;
  /** Puestos reales de la guía: la simulación de inventario nunca los agota. */
  stockProtegido?: boolean;
  /** El mercado tiene mapa interior (para «Llévame» al puesto). */
  interior?: boolean;
};

export async function resumenPuestos(): Promise<Record<string, PuestoResumen>> {
  const repo = getRepository();
  const out: Record<string, PuestoResumen> = {};
  const [enLinea, productores] = await Promise.all([repo.puestosEnLinea(), repo.productores()]);
  for (const { puesto: p, mercado: m } of enLinea) {
    out[p.id] = {
      id: p.id,
      tipo: "puesto",
      nombre: p.nombre,
      plan: p.plan,
      giro: p.giro,
      ubicacion: p.ubicacion_texto,
      mercadoId: m.id,
      mercadoNombre: m.nombre_display,
      lat: m.lat,
      lng: m.lng,
      stockProtegido: p.real_segun_guia || p.id === demoSeed.locatario.puesto_id,
      interior: !!m.interior_disponible,
    };
  }
  for (const p of productores) {
    out[p.id] = {
      id: p.id,
      tipo: "productor",
      recogida: p.entrega,
      nombre: p.nombre,
      plan: "Gratis",
      giro: p.producto_principal,
      ubicacion: `${p.pueblo}, ${p.alcaldia}`,
      // Sin sello: los sellos del pasaporte son de mercados.
      mercadoId: "",
      mercadoNombre: `${p.pueblo}, ${p.alcaldia}`,
      lat: p.lat,
      lng: p.lng,
    };
  }
  return out;
}

export type ColoniaEntrega = { alcaldia: string; colonia: string; lat: number; lng: number };

/** Colonias de entrega: las de los mercados del directorio, con su centroide. */
export async function coloniasEntrega(): Promise<ColoniaEntrega[]> {
  const grupos = new Map<string, { alcaldia: string; colonia: string; lat: number; lng: number; n: number }>();
  for (const m of await getRepository().mercados()) {
    const k = `${m.alcaldia}|${m.colonia}`;
    const g = grupos.get(k) ?? { alcaldia: m.alcaldia, colonia: m.colonia, lat: 0, lng: 0, n: 0 };
    g.lat += m.lat;
    g.lng += m.lng;
    g.n++;
    grupos.set(k, g);
  }
  return [...grupos.values()]
    .map(({ n, ...g }) => ({ ...g, lat: g.lat / n, lng: g.lng / n }))
    .sort((a, b) => a.alcaldia.localeCompare(b.alcaldia, "es") || a.colonia.localeCompare(b.colonia, "es"));
}
