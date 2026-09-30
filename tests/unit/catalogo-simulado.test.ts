import { describe, expect, it } from "vitest";

import mercadosJson from "../../data/mercados.json";
import { Mercados } from "@/lib/schemas";
import { Puesto } from "@/lib/schemas";
import { azar, esPuestoSimulado, hashTexto, mercadoDePuestoSimulado, mezclaDelMercado, puestosSimulados } from "@/lib/catalogo-simulado";

const mercados = Mercados.parse(mercadosJson);

describe("catálogo simulado", () => {
  it("es determinista: el mismo mercado genera los mismos puestos", () => {
    const m = mercados[10];
    expect(puestosSimulados(m)).toEqual(puestosSimulados(m));
    expect(azar(hashTexto("x")).sig()).toBe(azar(hashTexto("x")).sig());
  });

  it("todos los mercados tienen entre 6 y 14 puestos con productos, válidos según el esquema", () => {
    let total = 0;
    for (const m of mercados) {
      const ps = puestosSimulados(m);
      expect(ps.length).toBeGreaterThanOrEqual(6);
      expect(ps.length).toBeLessThanOrEqual(14);
      for (const p of ps) {
        expect(() => Puesto.parse(p)).not.toThrow();
        expect(p.simulado).toBe(true);
        expect(p.real_segun_guia).toBe(false);
        expect(p.productos.length).toBeGreaterThanOrEqual(3);
        for (const x of p.productos) expect(Number.isInteger(x.p) && x.p > 0).toBe(true);
      }
      total += ps.length;
    }
    expect(total).toBeGreaterThan(346 * 6);
  });

  it("ids únicos, codifican su mercado y no chocan con los puestos reales", () => {
    const ids = mercados.flatMap((m) => puestosSimulados(m).map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
    const id = puestosSimulados(mercados[0])[0].id;
    expect(esPuestoSimulado(id)).toBe(true);
    expect(mercadoDePuestoSimulado(id)).toBe(mercados[0].id);
    expect(esPuestoSimulado("pancita-dona-chela")).toBe(false);
  });

  it("no inventa horarios: sin horario en la guía, el puesto va vacío", () => {
    const sin = mercados.find((m) => !m.horario)!;
    expect(puestosSimulados(sin).every((p) => p.horario === "")).toBe(true);
    const con = mercados.find((m) => m.horario)!;
    expect(puestosSimulados(con)[0].horario).toBe(`${con.horario!.abre}–${con.horario!.cierra}`);
  });

  it("respeta el giro del mercado", () => {
    expect(mezclaDelMercado({ giros: ["flores"], tipos: ["especializado"] })).toEqual(["flores", "flores", "flores", "plantas"]);
    expect(mezclaDelMercado({ giros: [], tipos: ["mayorista"] })).toContain("mayoreo");
    const flores = mercados.find((m) => m.giros.includes("flores") && m.tipos.includes("especializado"));
    if (flores) expect(puestosSimulados(flores).every((p) => ["Flores", "Plantas y viveros"].includes(p.giro))).toBe(true);
  });
});
