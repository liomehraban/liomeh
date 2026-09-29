/**
 * Ruteo dentro de un mercado (plano esquemático). Implementación de referencia:
 * reproduce EXACTAMENTE las rutas_precalculadas de data/la_merced_interior.json.
 * Coordenadas SVG: x → este, y → abajo (sur).
 */
import type { Interior, RutaInterior } from "./schemas";

type Adj = Map<string, { to: string; w: number; via: string }[]>;

export function buildGraph(interior: Interior) {
  const pos = new Map(interior.grafo.nodos.map((n) => [n.id, n] as const));
  const adj: Adj = new Map(interior.grafo.nodos.map((n) => [n.id, []]));
  for (const e of interior.grafo.aristas) {
    const a = pos.get(e.a)!, b = pos.get(e.b)!;
    const w = Math.hypot(a.x - b.x, a.y - b.y);
    adj.get(e.a)!.push({ to: e.b, w, via: e.via });
    adj.get(e.b)!.push({ to: e.a, w, via: e.via });
  }
  return { pos, adj };
}

export function dijkstra(adj: Adj, src: string, dst: string) {
  const dist = new Map<string, number>([[src, 0]]);
  const prev = new Map<string, { u: string; via: string }>();
  const pq: [number, string][] = [[0, src]];
  const seen = new Set<string>();
  while (pq.length) {
    pq.sort((p, q) => p[0] - q[0] || (p[1] < q[1] ? -1 : 1));
    const [d, u] = pq.shift()!;
    if (u === dst) break;
    if (seen.has(u)) continue;
    seen.add(u);
    for (const { to, w, via } of adj.get(u) ?? []) {
      const nd = d + w;
      if (nd < (dist.get(to) ?? Infinity)) { dist.set(to, nd); prev.set(to, { u, via }); pq.push([nd, to]); }
    }
  }
  if (!dist.has(dst)) return null;
  const path = [dst]; const vias: string[] = [];
  while (path[path.length - 1] !== src) { const p = prev.get(path[path.length - 1])!; vias.push(p.via); path.push(p.u); }
  return { path: path.reverse(), vias: vias.reverse(), metros: dist.get(dst)! };
}

type Pt = { x: number; y: number };
export function giro(p0: Pt, p1: Pt, p2: Pt): "derecha" | "izquierda" | "recto" {
  const v1 = { x: p1.x - p0.x, y: p1.y - p0.y }, v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const c = v1.x * v2.y - v1.y * v2.x;
  const ang = Math.abs((Math.atan2(c, v1.x * v2.x + v1.y * v2.y) * 180) / Math.PI);
  if (ang < 35) return "recto";
  return c > 0 ? "derecha" : "izquierda"; // y hacia abajo ⇒ c>0 es giro a la derecha
}

const T = {
  es: {
    inicio: (desde: string, m: number, via: string) => `Desde ${desde}, avanza ${m} m por ${via}`,
    gira: (lado: string, m: number, via: string) => `Gira a la ${lado} y avanza ${m} m por ${via}`,
    recto: (m: number, via: string) => `Sigue derecho ${m} m por ${via}`,
    llegaste: (nombre: string, ub: string) => `Llegaste: ${nombre} está a tu lado (${ub}).`,
    lado: { derecha: "derecha", izquierda: "izquierda" },
  },
  en: {
    inicio: (desde: string, m: number, via: string) => `From ${desde}, walk ${m} m along ${via}`,
    gira: (lado: string, m: number, via: string) => `Turn ${lado} and walk ${m} m along ${via}`,
    recto: (m: number, via: string) => `Continue straight ${m} m along ${via}`,
    llegaste: (nombre: string, ub: string) => `You've arrived: ${nombre} is right here (${ub}).`,
    lado: { derecha: "right", izquierda: "left" },
  },
};

export function rutaInterior(interior: Interior, desde: string, puestoId: string, locale: "es" | "en" = "es"): RutaInterior | null {
  const puesto = interior.puestos.find((p) => p.id === puestoId);
  if (!puesto) return null;
  const pre = interior.rutas_precalculadas.find((r) => r.id === `${desde}__${puestoId}`);
  if (pre && locale === "es") return pre;

  const { pos, adj } = buildGraph(interior);
  const r = dijkstra(adj, desde, puesto.nodo_cercano);
  if (!r) return null;
  // agrupa segmentos consecutivos con el mismo "via"
  const segs: { via: string; m: number; desde: string; hasta: string }[] = [];
  r.path.slice(1).forEach((b, i) => {
    const a = r.path[i]; const via = r.vias[i];
    const m = Math.hypot(pos.get(a)!.x - pos.get(b)!.x, pos.get(a)!.y - pos.get(b)!.y);
    const last = segs[segs.length - 1];
    if (last && last.via === via) { last.m += m; last.hasta = b; } else segs.push({ via, m, desde: a, hasta: b });
  });
  const t = T[locale];
  const pasos = segs.map((s, i) => {
    const m = Math.round(s.m / 5) * 5 || 5;
    let instruccion: string;
    if (i === 0) instruccion = t.inicio(pos.get(desde)!.label, m, s.via);
    else {
      const g = giro(pos.get(segs[i - 1].desde)!, pos.get(s.desde)!, pos.get(s.hasta)!);
      instruccion = g === "recto" ? t.recto(m, s.via) : t.gira(t.lado[g], m, s.via);
    }
    return { n: i + 1, instruccion, metros: m, hasta_nodo: s.hasta };
  });
  pasos.push({ n: pasos.length + 1, instruccion: t.llegaste(puesto.nombre, puesto.ubicacion_texto), metros: 0, hasta_nodo: puesto.nodo_cercano });
  const total = Math.round(r.metros);
  return { id: `${desde}__${puestoId}`, desde, hacia_puesto: puestoId, nodos: r.path, pasos, distancia_m: total, minutos_caminando: Math.max(1, Math.round(total / 70)) };
}
