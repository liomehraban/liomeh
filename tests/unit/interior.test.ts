import { describe, it, expect } from "vitest";
import data from "../../data/la_merced_interior.json";
import { Interior } from "../../src/lib/schemas";
import { rutaInterior } from "../../src/lib/routing";
import { esOrigen, nodoEnPaso, puntosDeRuta, transformacionCentrada } from "../../src/lib/interior";

const interior = Interior.parse(data);
const ruta = rutaInterior(interior, "metro-merced", "pancita-dona-chela", "es")!;

describe("interior", () => {
  it("la ruta del guion: 636 m · 9 min, 6 pasos", () => {
    expect(ruta.distancia_m).toBe(636);
    expect(ruta.minutos_caminando).toBe(9);
    expect(ruta.pasos).toHaveLength(6);
  });
  it("en inglés: mismos nodos, 6 pasos y termina en «You've arrived»", () => {
    const en = rutaInterior(interior, "metro-merced", "pancita-dona-chela", "en")!;
    expect(en.nodos).toEqual(ruta.nodos);
    expect(en.pasos).toHaveLength(6);
    expect(en.distancia_m).toBe(636);
    expect(en.pasos[0].instruccion).toMatch(/^From /);
  });
  it("las 9 precalculadas en inglés dan los mismos nodos y distancia", () => {
    for (const pre of interior.rutas_precalculadas) {
      const en = rutaInterior(interior, pre.desde, pre.hacia_puesto, "en")!;
      expect(en.nodos).toEqual(pre.nodos);
      expect(en.pasos.map((p) => p.hasta_nodo)).toEqual(pre.pasos.map((p) => p.hasta_nodo));
    }
  });
  it("puntosDeRuta = nodos + puesto", () => {
    const pts = puntosDeRuta(interior, ruta);
    expect(pts).toHaveLength(ruta.nodos.length + 1);
    expect(pts.at(-1)).toEqual({ x: 125, y: 507 });
  });
  it("«Estás aquí» avanza al hasta_nodo del paso anterior", () => {
    expect(nodoEnPaso(ruta, 0)).toBe("metro-merced");
    expect(nodoEnPaso(ruta, 1)).toBe("NM-E4");
    expect(nodoEnPaso(ruta, 5)).toBe("BQ-14");
    expect(nodoEnPaso(ruta, 99)).toBe("BQ-14");
  });
  it("orígenes válidos", () => {
    expect(esOrigen("metro-merced")).toBe(true);
    expect(esOrigen("zocalo")).toBe(false);
    expect(esOrigen(null)).toBe(false);
  });
  it("transformacionCentrada pone el punto al centro", () => {
    const t = transformacionCentrada({ x: 600, y: 400 }, { w: 1200, h: 800 }, { w: 390, h: 500 }, 2);
    expect(390 / 1200 * 600 * 2 + t.x).toBeCloseTo(195);
    expect(390 / 1200 * 400 * 2 + t.y).toBeCloseTo(250);
  });
});
