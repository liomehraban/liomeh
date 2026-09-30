/**
 * Contexto recortado para el modelo: 15–25 registros relevantes según la búsqueda local
 * + los eventos de los próximos 30 días. Nada de datos de usuario.
 */
import { estadoHorario } from "../horario";
import { hoyCDMX, eventosVigentes } from "../eventos";
import { haversine, ZOCALO } from "../geo";
import { buscar, crearIndice, documentosBusqueda } from "../search";
import { detectarIntencion } from "./intents";
import type { DatosAsistente, Ubicacion } from "./types";

export const MIN_REGISTROS = 15;
export const MAX_REGISTROS = 25;

export type Contexto = {
  ahora: string;
  mercados: Record<string, unknown>[];
  puestos: Record<string, unknown>[];
  productores: Record<string, unknown>[];
  eventos: Record<string, unknown>[];
  rutas: Record<string, unknown>[];
};

export function construirContexto(mensaje: string, d: DatosAsistente, now = new Date(), ubicacion?: Ubicacion | null): Contexto {
  const indice = crearIndice(
    documentosBusqueda(
      d.mercados,
      Object.fromEntries(d.mercados.filter((m) => m.interior_disponible).map((m) => [m.id, d.puestos.filter((p) => p.mercadoId === m.id)])),
      d.productores,
    ),
  );
  const r = buscar(indice, mensaje, 10);
  const ids = {
    mercado: new Set(r.mercado.map((x) => x.doc.destino)),
    puesto: new Set([...r.puesto, ...r.producto].map((x) => x.doc.destino)),
    productor: new Set(r.productor.map((x) => x.doc.destino)),
  };

  // Completa hasta el mínimo con lo más útil para la intención: destacados cercanos y abiertos.
  const origen = ubicacion ?? ZOCALO;
  const intencion = detectarIntencion(mensaje);
  const relleno = [...d.mercados.filter((m) => m.destacado)].sort(
    (a, b) =>
      Number(estadoHorario(b.horario, now).estado === "abierto") - Number(estadoHorario(a.horario, now).estado === "abierto") ||
      haversine(origen, a) - haversine(origen, b),
  );
  const total = () => ids.mercado.size + ids.puesto.size + ids.productor.size;
  for (const m of relleno) {
    if (total() >= MIN_REGISTROS) break;
    ids.mercado.add(m.id);
  }
  if (intencion === "productor" || intencion === "comercioJusto") d.productores.slice(0, 6).forEach((p) => total() < MAX_REGISTROS && ids.productor.add(p.id));
  if (intencion === "llegar" || intencion === "comida") d.puestos.filter((p) => p.real_segun_guia).forEach((p) => total() < MAX_REGISTROS && ids.puesto.add(p.id));

  // Recorta al máximo respetando el orden de relevancia.
  const recortar = <T,>(s: Set<T>, n: number) => new Set([...s].slice(0, n));
  let restantes = MAX_REGISTROS;
  const pm = recortar(ids.puesto, Math.min(ids.puesto.size, 10));
  restantes -= pm.size;
  const pr = recortar(ids.productor, Math.min(ids.productor.size, 8, restantes));
  restantes -= pr.size;
  const me = recortar(ids.mercado, Math.max(0, restantes));

  const hoy = hoyCDMX(now);
  const limite = new Date(now.getTime() + 30 * 86_400_000).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

  return {
    ahora: now.toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "full", timeStyle: "short" }),
    mercados: d.mercados
      .filter((m) => me.has(m.id))
      .map((m) => ({
        id: m.id,
        nombre: m.nombre_display,
        alcaldia: m.alcaldia,
        direccion: m.direccion,
        horario: m.horario?.texto ?? null,
        estado_ahora: estadoHorario(m.horario, now).estado,
        km: Math.round(haversine(origen, m) / 100) / 10,
        lema: m.lema,
        imperdibles: m.imperdibles,
        giros: m.giros,
      })),
    puestos: d.puestos
      .filter((p) => pm.has(p.id))
      .map((p) => ({ id: p.id, nombre: p.nombre, mercado: p.mercadoId, ubicacion: p.ubicacion_texto, horario: p.horario, productos: p.productos.map((x) => `${x.n} $${x.p}/${x.u}`), rating: p.rating })),
    productores: d.productores
      .filter((p) => pr.has(p.id))
      .map((p) => ({ id: p.id, nombre: p.nombre, pueblo: p.pueblo, alcaldia: p.alcaldia, producto: p.producto_principal, precio_mayoreo: p.precio_mayoreo_app, comercio_justo: p.comercio_justo })),
    eventos: eventosVigentes(d.eventos, now)
      .filter((e) => e.inicio === "recurrente" || (e.inicio <= limite && (e.fin ?? e.inicio) >= hoy))
      .map((e) => ({ id: e.id, titulo: e.titulo, inicio: e.inicio, fin: e.fin, lugar: e.lugar, fecha_confirmada: e.fecha_confirmada, mercado_id: e.mercado_id })),
    rutas: d.rutas.map((r) => ({ id: r.id, titulo: r.titulo, tipo: r.tipo, duracion_h: r.duracion_h, km: r.km })),
  };
}

export const registrosContexto = (c: Contexto) => c.mercados.length + c.puestos.length + c.productores.length;
