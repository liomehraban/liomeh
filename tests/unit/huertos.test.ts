import { describe, it, expect } from "vitest";
import data from "../../data/huertos.json";
import { Huertos } from "../../src/lib/schemas";
import { anilloGeoJSON, cultivosDe, deTemporada, filtrarProductores, mesCDMX, mesesDeTemporada, nombreMayoreo, proximosDias } from "../../src/lib/huertos";

const h = Huertos.parse(data);
const prod = (id: string) => h.productores.find((p) => p.id === id)!;
const SEP = 8;

describe("polígonos", () => {
  it("se invierten a [lng, lat] y el anillo se cierra", () => {
    for (const z of h.zonas) {
      const r = anilloGeoJSON(z.poligono_ilustrativo);
      expect(r[0]).toEqual(r.at(-1));
      expect(r).toHaveLength(z.poligono_ilustrativo.length + 1);
      // sur de la CDMX: lng ≈ −99.3…−98.9, lat ≈ 19.1…19.35 (no en el océano)
      for (const [lng, lat] of r) {
        expect(lng).toBeGreaterThan(-99.4);
        expect(lng).toBeLessThan(-98.8);
        expect(lat).toBeGreaterThan(19.05);
        expect(lat).toBeLessThan(19.4);
      }
    }
  });
});

describe("temporada", () => {
  it("heurística de meses", () => {
    expect(mesesDeTemporada("Todo el año; pico abril–septiembre")).toHaveLength(12);
    expect(mesesDeTemporada("Maíz: cosecha nov–ene")).toEqual([0, 10, 11]);
    expect(mesesDeTemporada("Cempasúchil: oct; nochebuena: nov–dic")).toEqual([9, 10, 11]);
    expect(mesesDeTemporada("Romeritos: nov–dic y Semana Santa")).toEqual([2, 3, 10, 11]);
    expect(mesesDeTemporada("Julio–septiembre")).toEqual([6, 7, 8]);
    expect(mesesDeTemporada("Temporal jun–oct")).toEqual([5, 6, 7, 8, 9]);
  });
  it("en septiembre: hongos y papa sí; maíz de invierno y romeritos no", () => {
    expect(deTemporada(prod("prod-tlal-03").temporada, SEP)).toBe(true);
    expect(deTemporada(prod("prod-tlal-02").temporada, SEP)).toBe(true);
    expect(deTemporada(prod("prod-milpa-02").temporada, SEP)).toBe(false);
    expect(deTemporada(prod("prod-xochi-02").temporada, SEP)).toBe(false);
  });
  it("mes en hora CDMX", () => expect(mesCDMX(new Date("2026-10-01T03:00:00Z"))).toBe(8));
});

describe("cultivos", () => {
  it("clasifica productores", () => {
    expect(cultivosDe(prod("prod-milpa-01"))).toEqual(["nopal"]);
    expect(cultivosDe(prod("prod-milpa-02"))).toEqual(["nopal", "maiz"]);
    expect(cultivosDe(prod("prod-xochi-03"))).toContain("amaranto");
    expect(cultivosDe(prod("prod-xochi-04"))).toContain("flores");
    expect(cultivosDe(prod("prod-tlal-03"))).toEqual(["hongos"]);
    expect(cultivosDe(prod("prod-xochi-01"))).toEqual(["hortalizas"]);
  });
  it("solo el mole y la avena/papa quedan fuera de los 6 chips", () => {
    const sin = h.productores.filter((p) => !cultivosDe(p).length).map((p) => p.id);
    expect(sin).toEqual(["prod-milpa-03", "prod-tlal-02"]);
  });
  it("filtros: cultivos OR, temporada AND", () => {
    const r = filtrarProductores(h.productores, { cultivos: ["nopal", "hongos"], temporada: false }, SEP);
    expect(r.map((p) => p.id).sort()).toEqual(["prod-milpa-01", "prod-milpa-02", "prod-milpa-04", "prod-tlal-03"]);
    const t = filtrarProductores(h.productores, { cultivos: ["maiz"], temporada: true }, SEP);
    expect(t.map((p) => p.id)).toEqual([]);
  });
});

it("nombreMayoreo y proximosDias", () => {
  expect(nombreMayoreo(prod("prod-milpa-01"))).toBe("Nopal verdura (ciento)");
  const d = proximosDias(14, new Date("2026-09-29T18:00:00Z"));
  expect(d).toHaveLength(14);
  expect(d[0]).toBe("2026-09-30");
  expect(d[13]).toBe("2026-10-13");
});

describe("venta mínima de mayoreo", () => {
  it("aplica el mínimo solo si está en la misma unidad que el precio", async () => {
    const { minimoMayoreo } = await import("@/lib/huertos");
    expect(minimoMayoreo("10 kg", "kg")).toBe(10);
    expect(minimoMayoreo("5 kg", "kg")).toBe(5);
    expect(minimoMayoreo("1 caja", "kg")).toBe(1);
    expect(minimoMayoreo("10 kg", "ciento")).toBe(1);
    expect(minimoMayoreo("", "kg")).toBe(1);
  });
});
