import { describe, it, expect } from "vitest";
import demo from "../../data/usuarios_demo.json";
import { indiceSemana, kpisHoy, puedeAgregarProducto, saludoPorHora, semanaConHoy, siguienteEstadoLocatario, teclear } from "../../src/lib/locatario";
import { difPrecio, normalizarEstadoMayoreo, siguientesEstadosMayoreo } from "../../src/lib/productor";

const base = demo.locatario.hoy;

describe("locatario", () => {
  it("sin actividad, los KPIs son los de usuarios_demo", () => expect(kpisHoy(base, { cobros: [], pedidosApp: [], checkins: 0 })).toEqual(base));
  it("paso 8: cobrar $250 con QR suma a ventas y cobros; el pedido del paso 4 suma $300 (sin el servicio de $9)", () => {
    const k = kpisHoy(base, { cobros: [250], pedidosApp: [300], checkins: 1 });
    expect(k.ventas_mxn).toBe(8420 + 250 + 300);
    expect(k.cobros_qr).toBe(42);
    expect(k.pedidos_app).toBe(24);
    expect(k.checkins_efectivo).toBe(38);
    expect(k.ticket_promedio).toBeGreaterThan(100);
  });
  it("saludo por hora CDMX", () => {
    expect(saludoPorHora(new Date("2026-10-01T15:00:00Z"))).toBe("dias"); // 09:00
    expect(saludoPorHora(new Date("2026-10-01T20:00:00Z"))).toBe("tardes"); // 14:00
    expect(saludoPorHora(new Date("2026-10-02T02:00:00Z"))).toBe("noches"); // 20:00
  });
  it("semana: últimos 7 días terminando en hoy, con la barra de hoy igual a «Ventas de hoy»", () => {
    const jueves = new Date("2026-10-01T18:00:00Z");
    expect(indiceSemana(jueves)).toBe(3);
    const s = semanaConHoy(demo.locatario.semana, 8670, jueves);
    expect(s.map((x) => x.d)).toEqual(["Vie", "Sáb", "Dom", "Lun", "Mar", "Mié", "Jue"]);
    expect(s[6].v).toBe(8670);
    expect(s[0].v).toBe(demo.locatario.semana[4].v);
  });
  it("estados de pedido", () => {
    expect(siguienteEstadoLocatario(undefined)).toBe("preparando");
    expect(siguienteEstadoLocatario("listo")).toBe("entregado");
    expect(siguienteEstadoLocatario("entregado")).toBe("entregado");
  });
  it("catálogo: máximo 20 en Gratis", () => {
    expect(puedeAgregarProducto(19, "Gratis")).toBe(true);
    expect(puedeAgregarProducto(20, "Gratis")).toBe(false);
    expect(puedeAgregarProducto(50, "Pro")).toBe(true);
  });
  it("teclado de cobro", () => {
    let m = "";
    for (const k of ["0", "2", "5", "0"]) m = teclear(m, k);
    expect(m).toBe("250");
    expect(teclear(m, "⌫")).toBe("25");
    expect(teclear(m, "C")).toBe("");
    expect(teclear("999999", "9")).toBe("999999");
  });
});

describe("productor", () => {
  it("normaliza estados de usuarios_demo", () => {
    expect(demo.productor.pedidos_mayoreo.map((p) => normalizarEstadoMayoreo(p.estado))).toEqual(["confirmado", "listo", "enviado"]);
  });
  it("flujo Nuevo → Confirmado → Listo/Enviado → Entregado", () => {
    expect(siguientesEstadosMayoreo("nuevo")).toEqual(["confirmado"]);
    expect(siguientesEstadosMayoreo("confirmado")).toEqual(["listo", "enviado"]);
    expect(siguientesEstadosMayoreo("enviado")).toEqual(["entregado"]);
    expect(siguientesEstadosMayoreo("entregado")).toEqual([]);
  });
  it("precio sugerido vs mercado", () => {
    expect(difPrecio(12, 18)).toBe(-33);
    expect(difPrecio(20, 18)).toBe(11);
  });
});

import { catalogoEfectivo } from "../../src/lib/locatario";
describe("catálogo efectivo", () => {
  it("aplica ediciones y suma los productos agregados", () => {
    const c = catalogoEfectivo([{ n: "Sope", p: 35, u: "pieza" }], [{ n: "Tlacoyo", p: 30, u: "pieza" }], { Sope: { p: 40, disponible: false } });
    expect(c).toEqual([
      { n: "Sope", p: 40, u: "pieza", disponible: false, extra: false },
      { n: "Tlacoyo", p: 30, u: "pieza", disponible: true, extra: true },
    ]);
  });
  it("un cobro con tarjeta suma a ventas pero no a «Cobros QR»", () => {
    const k = kpisHoy(base, { cobros: [250, 100], cobrosQr: 1, pedidosApp: [], checkins: 0 });
    expect(k.ventas_mxn).toBe(8420 + 350);
    expect(k.cobros_qr).toBe(base.cobros_qr + 1);
  });
});
