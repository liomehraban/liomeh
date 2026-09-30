import { describe, it, expect } from "vitest";
import data from "../../data/la_merced_interior.json";
import { Interior } from "../../src/lib/schemas";
import { rutaInterior } from "../../src/lib/routing";
import { escalaAjuste, esOrigen, nodoEnPaso, puntosDeRuta, separarDe, tamEtiqueta, transformacionCentrada } from "../../src/lib/interior";

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
  it("transformacionCentrada respeta los márgenes de los controles", () => {
    const t = transformacionCentrada({ x: 600, y: 400 }, { w: 1200, h: 800 }, { w: 390, h: 500 }, 2, { top: 60 });
    expect(390 / 1200 * 400 * 2 + t.y).toBeCloseTo(280);
  });
  it("escalaAjuste encuadra el plano completo", () => {
    // Ancho manda: 374 px libres de 390.
    expect(escalaAjuste({ w: 1200, h: 800 }, { w: 390, h: 600 }, { left: 8, right: 8, top: 60 })).toBeCloseTo(374 / 390);
    // Alto manda: contenedor bajo.
    const e = escalaAjuste({ w: 1200, h: 800 }, { w: 390, h: 200 }, { top: 60 });
    expect(e * (390 / 1200) * 800).toBeCloseTo(140);
  });
  it("tamEtiqueta: mínimo en pantalla u oculta si no cabe", () => {
    expect(tamEtiqueta("Nave Mayor", 17, 800, 0.325)! * 0.325).toBeGreaterThanOrEqual(10);
    expect(tamEtiqueta("Nave Mayor", 17, 800, 2)).toBe(17);
    expect(tamEtiqueta("Mercado Banquetón", 17, 180, 0.325)).toBeNull();
  });
  it("separarDe aleja los íconos encimados", () => {
    const p = separarDe({ x: 130, y: 530 }, [{ x: 125, y: 507 }], 30);
    expect(Math.hypot(p.x - 125, p.y - 507)).toBeCloseTo(30);
    expect(separarDe({ x: 0, y: 0 }, [{ x: 100, y: 100 }], 30)).toEqual({ x: 0, y: 0 });
  });
});
