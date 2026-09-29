import { describe, it, expect } from "vitest";
import data from "../../data/la_merced_interior.json";
import { Interior } from "../../src/lib/schemas";
import { rutaInterior, buildGraph, dijkstra } from "../../src/lib/routing";

const interior = Interior.parse(data);

describe("routing La Merced", () => {
  it.each(interior.rutas_precalculadas.map((r) => [r.id, r] as const))("recalcula %s igual que la precalculada", (_id, pre) => {
    const { adj } = buildGraph(interior);
    const puesto = interior.puestos.find((p) => p.id === pre.hacia_puesto)!;
    const r = dijkstra(adj, pre.desde, puesto.nodo_cercano)!;
    expect(r.path).toEqual(pre.nodos);
    expect(Math.round(r.metros)).toBe(pre.distancia_m);
  });

  it("genera instrucciones idénticas en español cuando se fuerza el cálculo", () => {
    const pre = interior.rutas_precalculadas[0];
    const sinPre = { ...interior, rutas_precalculadas: [] };
    const r = rutaInterior(sinPre, pre.desde, pre.hacia_puesto, "es")!;
    expect(r.pasos.map((p) => p.instruccion)).toEqual(pre.pasos.map((p) => p.instruccion));
  });

  it("todos los puestos son alcanzables desde el Metro Merced", () => {
    for (const p of interior.puestos) expect(rutaInterior({ ...interior, rutas_precalculadas: [] }, "metro-merced", p.id)).not.toBeNull();
  });

  it("devuelve instrucciones en inglés", () => {
    const r = rutaInterior(interior, "metro-merced", "dona-tere", "en")!;
    expect(r.pasos.at(-1)!.instruccion).toMatch(/You've arrived/);
  });
});
