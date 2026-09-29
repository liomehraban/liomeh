import { describe, it, expect } from "vitest";
import lealtad from "../../data/lealtad.json";
import { nivelActual, progreso, puntosPorCompra } from "../../src/lib/loyalty";

const niveles = lealtad.niveles;

describe("loyalty", () => {
  it("floor(total/10): $309 → 30 puntos", () => expect(puntosPorCompra(309)).toBe(30));
  it("dobles con huerto", () => expect(puntosPorCompra(309, { dobles: true })).toBe(60));
  it("nunca negativos", () => expect(puntosPorCompra(-50)).toBe(0));
  it("niveles de lealtad.json", () => {
    expect(nivelActual(0, niveles).nivel).toBe("Marchante");
    expect(nivelActual(740, niveles).nivel).toBe("Casero");
    expect(nivelActual(1500, niveles).nivel).toBe("Compadre de Mercado");
    expect(nivelActual(99999, niveles).nivel).toBe("Leyenda de Mercado");
  });
  it("progreso hacia el siguiente nivel", () => {
    const p = progreso(740, niveles);
    expect(p.siguiente?.nivel).toBe("Compadre de Mercado");
    expect(p.faltan).toBe(760);
    expect(p.pct).toBe(24);
    expect(progreso(5000, niveles)).toMatchObject({ siguiente: null, pct: 100 });
  });
});
