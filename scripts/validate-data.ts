/**
 * pnpm validate:data  →  tsx scripts/validate-data.ts
 * Valida /data contra src/lib/schemas.ts y revisa referencias cruzadas.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as S from "../src/lib/schemas";

const load = (f: string) => JSON.parse(readFileSync(join(process.cwd(), "data", f), "utf8"));
const errors: string[] = [];
const check = <T>(name: string, schema: { safeParse: (x: unknown) => { success: boolean; error?: unknown; data?: T } }, file: string): T | undefined => {
  const r = schema.safeParse(load(file));
  if (!r.success) { errors.push(`${name}: ${JSON.stringify((r.error as { issues?: unknown[] })?.issues?.slice(0, 5), null, 1)}`); return; }
  return r.data;
};

const mercados = check("mercados", S.Mercados, "mercados.json");
const interior = check("interior", S.Interior, "la_merced_interior.json");
const huertos = check("huertos", S.Huertos, "huertos.json");
const eventos = check("eventos", S.Eventos, "eventos.json");
const rutas = check("rutas", S.Rutas, "rutas_experiencias.json");
check("lealtad", S.Lealtad, "lealtad.json");
const resenas = check("resenas", S.Resenas, "resenas.json");
const demo = check("usuarios_demo", S.UsuariosDemo, "usuarios_demo.json");
check("metricas", S.MetricasGobierno, "metricas_gobierno.json");
check("modelo", S.ModeloNegocio, "modelo_negocio.json");

if (mercados && interior && huertos && eventos && rutas && resenas && demo) {
  const ids = new Set(mercados.map((m) => m.id));
  if (ids.size !== mercados.length) errors.push("ids de mercados duplicados");
  const prod = new Set(huertos.productores.map((p) => p.id));
  const puestos = new Set(interior.puestos.map((p) => p.id));
  const nodos = new Set(interior.grafo.nodos.map((n) => n.id));
  const zonas = new Set(huertos.zonas.map((z) => z.id));
  if (!ids.has(interior.mercado_id)) errors.push(`interior.mercado_id ${interior.mercado_id} no existe`);
  interior.puestos.forEach((p) => {
    if (!nodos.has(p.nodo_cercano)) errors.push(`puesto ${p.id}: nodo ${p.nodo_cercano} no existe`);
    p.origen?.forEach((o) => o.huerto_id && !prod.has(o.huerto_id) && errors.push(`puesto ${p.id}: huerto ${o.huerto_id} no existe`));
  });
  interior.grafo.aristas.forEach((a) => (!nodos.has(a.a) || !nodos.has(a.b)) && errors.push(`arista ${a.a}-${a.b} rota`));
  interior.rutas_precalculadas.forEach((r) => {
    if (!puestos.has(r.hacia_puesto)) errors.push(`ruta ${r.id}: puesto inexistente`);
    r.nodos.forEach((n) => !nodos.has(n) && errors.push(`ruta ${r.id}: nodo ${n} inexistente`));
  });
  huertos.productores.forEach((p) => !zonas.has(p.zona_id) && errors.push(`productor ${p.id}: zona inexistente`));
  eventos.forEach((e) => e.mercado_id && !ids.has(e.mercado_id) && errors.push(`evento ${e.id}: mercado ${e.mercado_id} inexistente`));
  rutas.forEach((r) => r.paradas.forEach((s) => !ids.has(s) && !prod.has(s) && errors.push(`ruta ${r.id}: parada ${s} inexistente`)));
  resenas.forEach((r) => !ids.has(r.objetivo_id) && !puestos.has(r.objetivo_id) && !prod.has(r.objetivo_id) && errors.push(`reseña ${r.id}: objetivo ${r.objetivo_id} inexistente`));
  if (!puestos.has(demo.locatario.puesto_id)) errors.push("demo.locatario.puesto_id inexistente");
  if (!prod.has(demo.productor.productor_id)) errors.push("demo.productor.productor_id inexistente");
  const conInterior = mercados.filter((m) => m.interior_disponible);
  if (conInterior.length !== 1 || conInterior[0].id !== "la-merced") errors.push("se esperaba solo la-merced con interior_disponible");
}

if (errors.length) { console.error("❌ Datos inválidos:\n" + errors.join("\n")); process.exit(1); }
console.log("✅ /data válido: esquemas y referencias cruzadas OK");
