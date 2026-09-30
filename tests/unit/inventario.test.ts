import { describe, expect, it } from "vitest";

import { actividadPuesto, avanceDelDia, claveVenta, stockActual, stockInicial } from "@/lib/inventario";

// Horas CDMX (UTC−6)
const a = (hhmm: string, dia = "2026-10-01") => new Date(`${dia}T${hhmm}:00-06:00`);
const jitomate = { n: "Jitomate saladet", p: 28, u: "kg" };

describe("inventario vivo", () => {
  it("la curva del día va de 0 (antes de abrir) a 1 (al cierre) y es creciente", () => {
    expect(avanceDelDia(6 * 60)).toBe(0);
    expect(avanceDelDia(19 * 60)).toBe(1);
    expect(avanceDelDia(10 * 60)).toBeLessThan(avanceDelDia(14 * 60));
  });

  it("amanece surtido y baja durante el día; al día siguiente se resurte", () => {
    const temprano = stockActual("x--1", jitomate, a("06:30"));
    const tarde = stockActual("x--1", jitomate, a("17:30"));
    expect(temprano.disponible).toBe(temprano.inicial);
    expect(temprano.estado).toBe("surtido");
    expect(tarde.disponible).toBeLessThan(temprano.disponible);
    const manana = stockActual("x--1", jitomate, a("06:30", "2026-10-02"));
    expect(manana.disponible).toBe(manana.inicial);
  });

  it("es determinista: mismo producto, misma hora → misma existencia", () => {
    expect(stockActual("x--1", jitomate, a("12:00"))).toEqual(stockActual("x--1", jitomate, a("12:00")));
  });

  it("resta lo que compró la persona y respeta la pausa del locatario", () => {
    const base = stockActual("x--1", jitomate, a("08:00"));
    expect(stockActual("x--1", jitomate, a("08:00"), { vendidosDemo: 2 }).disponible).toBe(base.disponible - 2);
    expect(stockActual("x--1", jitomate, a("08:00"), { vendidosDemo: 9999 }).estado).toBe("agotado");
    expect(stockActual("x--1", jitomate, a("08:00"), { pausado: true })).toMatchObject({ disponible: 0, estado: "agotado" });
  });

  it("los puestos protegidos (reales / guion) nunca se agotan por la simulación", () => {
    for (let d = 1; d <= 28; d++) {
      const dia = `2026-10-${String(d).padStart(2, "0")}`;
      const s = stockActual("pancita-dona-chela", { n: "Pancita (pata, libro y cuaderno)", p: 115, u: "plato" }, a("17:59", dia), { protegido: true });
      expect(s.disponible).toBeGreaterThanOrEqual(2);
    }
  });

  it("productos caros amanecen con pocas piezas", () => {
    expect(stockInicial("x--1", { n: "Mesa de centro", p: 1800, u: "pieza" }, "2026-10-01")).toBeLessThanOrEqual(8);
  });

  it("actividad: sin pedidos antes de abrir, con pedidos por la tarde", () => {
    expect(actividadPuesto("x--1", a("06:00")).pedidosHoy).toBe(0);
    const t = actividadPuesto("x--1", a("15:00"));
    expect(t.pedidosHoy).toBeGreaterThan(0);
    expect(t.hace).toBeGreaterThanOrEqual(1);
  });

  it("la clave de venta incluye el día", () => {
    expect(claveVenta("2026-10-01", "p", "Sope")).toBe("2026-10-01|p::Sope");
  });
});

describe("unidades en plural", () => {
  it("pluraliza la primera palabra y deja kg/L", async () => {
    const { unidadPlural } = await import("@/lib/inventario");
    expect(unidadPlural("plato", 20)).toBe("platos");
    expect(unidadPlural("plato", 1)).toBe("plato");
    expect(unidadPlural("kg", 7)).toBe("kg");
    expect(unidadPlural("vaso 1/2 L", 3)).toBe("vasos 1/2 L");
    expect(unidadPlural("menú", 2)).toBe("menús");
    expect(unidadPlural("par", 4)).toBe("pares");
  });
  it("después del cierre no hay «último pedido»", async () => {
    const { actividadPuesto } = await import("@/lib/inventario");
    const r = actividadPuesto("x--1", new Date("2026-10-01T21:00:00-06:00"));
    expect(r.pedidosHoy).toBeGreaterThan(0);
    expect(r.hace).toBeNull();
  });
});
