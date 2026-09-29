/**
 * Búsqueda local sin acentos y tolerante a errores sobre mercados, puestos, productos y productores.
 * Puntaje por campo: nombre > giros > imperdibles > productos de puestos > texto libre (resumen, catálogo).
 */

export type TipoResultado = "mercado" | "puesto" | "producto" | "productor";

export type DocBusqueda = {
  tipo: TipoResultado;
  id: string;
  /** Destino del resultado: id del mercado/puesto/productor al que lleva. */
  destino: string;
  titulo: string;
  subtitulo?: string;
  campos: Partial<Record<Campo, string[]>>;
};

export type Campo = "nombre" | "giros" | "imperdibles" | "productos" | "texto";

export const PESO: Record<Campo, number> = { nombre: 10, giros: 6, imperdibles: 4, productos: 3, texto: 1.5 };

export type Resultado = { doc: DocBusqueda; score: number };

export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

const VACIAS = new Set(["de", "del", "la", "las", "el", "los", "y", "en", "a", "the", "of", "and", "mercado", "market"]);

export function tokenizar(s: string): string[] {
  return normalizar(s)
    .split(" ")
    .filter((t) => t && !VACIAS.has(t));
}

/** Distancia de Levenshtein con corte temprano. */
export function levenshtein(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      min = Math.min(min, cur[j]);
    }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Qué tan bien empata un token de la consulta con un token del documento (0 = nada, 1 = exacto). */
function empate(q: string, t: string): number {
  if (t === q) return 1;
  if (q.length >= 2 && t.startsWith(q)) return 0.85;
  if (q.length < 4) return 0;
  const tol = q.length >= 7 ? 2 : 1;
  // compara contra el token completo y contra su prefijo del largo de la consulta (errores al escribir a medias)
  const d = Math.min(levenshtein(q, t, tol), t.length > q.length ? levenshtein(q, t.slice(0, q.length), tol) : tol + 1);
  return d <= tol ? 0.6 - 0.1 * d : 0;
}

type Indexado = { doc: DocBusqueda; tokens: Partial<Record<Campo, string[]>> };

export type IndiceBusqueda = Indexado[];

export function crearIndice(docs: DocBusqueda[]): IndiceBusqueda {
  return docs.map((doc) => ({
    doc,
    tokens: Object.fromEntries(Object.entries(doc.campos).map(([c, vals]) => [c, [...new Set((vals ?? []).flatMap(tokenizar))]])),
  }));
}

function puntuar(ix: Indexado, qTokens: string[]): number {
  let total = 0;
  for (const q of qTokens) {
    let mejor = 0;
    for (const [campo, toks] of Object.entries(ix.tokens) as [Campo, string[]][]) {
      for (const t of toks) {
        const e = empate(q, t);
        if (e) mejor = Math.max(mejor, e * PESO[campo]);
      }
    }
    if (!mejor) return 0; // todos los tokens deben aparecer
    total += mejor;
  }
  return total;
}

export function buscar(indice: IndiceBusqueda, consulta: string, limitePorTipo = 5): Record<TipoResultado, Resultado[]> {
  const out: Record<TipoResultado, Resultado[]> = { mercado: [], puesto: [], producto: [], productor: [] };
  const q = tokenizar(consulta);
  if (!q.length) return out;
  for (const ix of indice) {
    const score = puntuar(ix, q);
    if (score > 0) out[ix.doc.tipo].push({ doc: ix.doc, score });
  }
  for (const k of Object.keys(out) as TipoResultado[]) {
    out[k] = out[k].sort((a, b) => b.score - a.score || a.doc.titulo.localeCompare(b.doc.titulo)).slice(0, limitePorTipo);
  }
  return out;
}

// ---------- construcción de documentos desde los datos ----------

type MercadoBusq = { id: string; nombre_display: string; alcaldia: string; giros: string[]; imperdibles?: string[]; resumen?: string; resumen_en?: string; sub_mercados?: string[] };
type PuestoBusq = { id: string; nombre: string; giro: string; ubicacion_texto: string; productos: { n: string }[] };
type ProductorBusq = { id: string; nombre: string; pueblo: string; alcaldia: string; producto_principal: string; catalogo: string[] };

/**
 * `puestosPorMercado`: puestos con interior en línea, para que el mercado también se encuentre por sus productos.
 */
export function documentosBusqueda(
  mercados: MercadoBusq[],
  puestosPorMercado: Record<string, PuestoBusq[]>,
  productores: ProductorBusq[],
): DocBusqueda[] {
  const docs: DocBusqueda[] = [];
  for (const m of mercados) {
    const puestos = puestosPorMercado[m.id] ?? [];
    docs.push({
      tipo: "mercado",
      id: m.id,
      destino: m.id,
      titulo: m.nombre_display,
      subtitulo: m.alcaldia,
      campos: {
        nombre: [m.nombre_display],
        giros: m.giros,
        imperdibles: [...(m.imperdibles ?? []), ...puestos.map((p) => p.nombre)],
        productos: puestos.flatMap((p) => p.productos.map((x) => x.n)),
        texto: [m.resumen ?? "", m.resumen_en ?? "", ...(m.sub_mercados ?? []), m.alcaldia],
      },
    });
    for (const p of puestos) {
      docs.push({
        tipo: "puesto",
        id: p.id,
        destino: p.id,
        titulo: p.nombre,
        subtitulo: `${m.nombre_display} · ${p.ubicacion_texto}`,
        campos: { nombre: [p.nombre], giros: [p.giro], productos: p.productos.map((x) => x.n) },
      });
      for (const x of p.productos) {
        docs.push({
          tipo: "producto",
          id: `${p.id}::${x.n}`,
          destino: p.id,
          titulo: x.n,
          subtitulo: p.nombre,
          campos: { nombre: [x.n], giros: [p.giro] },
        });
      }
    }
  }
  for (const p of productores) {
    docs.push({
      tipo: "productor",
      id: p.id,
      destino: p.id,
      titulo: p.nombre,
      subtitulo: `${p.pueblo}, ${p.alcaldia}`,
      campos: { nombre: [p.nombre], giros: [p.producto_principal], productos: p.catalogo, texto: [p.pueblo, p.alcaldia] },
    });
  }
  return docs;
}
