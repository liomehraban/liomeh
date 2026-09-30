import { describe, it, expect } from "vitest";
import { paradasHechas, proyectar } from "../../src/lib/rutas";

const inicio = "2026-10-01T15:00:00.000Z";
describe("rutas", () => {
  it("avanza con check-ins en los mercados de la ruta, después del inicio", () => {
    const e = {
      checkins: [
        { objetivo: "mercado:53-rio-blanco", mercadoId: "53-rio-blanco", fecha: "2026-10-01T16:00:00.000Z" },
        { objetivo: "jugos-moreno", mercadoId: "la-merced", fecha: "2026-09-30T16:00:00.000Z" }, // antes de iniciar
      ],
      pedidos: [],
      reservasVisita: [],
    };
    const h = paradasHechas(["53-rio-blanco", "65-jamaica-comidas", "la-merced"], e, inicio);
    expect([...h]).toEqual(["53-rio-blanco"]);
  });
  it("productores: compra o visita", () => {
    const e = {
      checkins: [],
      pedidos: [{ puestoId: "prod-xochi-01", fecha: "2026-10-01T17:00:00.000Z" }],
      reservasVisita: [{ productorId: "prod-xochi-03", creada: "2026-10-01T18:00:00.000Z" }],
    };
    expect(paradasHechas(["44-xochimilco-zona-xochitl", "prod-xochi-01", "prod-xochi-03"], e, inicio).size).toBe(2);
  });
  it("proyectar mantiene el norte arriba y cabe en el lienzo", () => {
    const [a, b] = proyectar([{ lat: 19.5, lng: -99.2 }, { lat: 19.3, lng: -99.0 }], 120, 80);
    expect(a.y).toBeLessThan(b.y);
    expect(a.x).toBeLessThan(b.x);
    for (const p of [a, b]) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(120);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(80);
    }
  });
});
