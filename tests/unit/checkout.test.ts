import { describe, it, expect } from "vitest";
import { ajusteDistancia, costoEnvio, formatearTarjeta, luhn, payloadCoDi, resumenPedido, vigenciaValida } from "../../src/lib/checkout";

const guion = { puestoId: "pancita-dona-chela", items: [
  { nombre: "Pancita", precio: 115, unidad: "plato", qty: 2 },
  { nombre: "Sope", precio: 35, unidad: "pieza", qty: 2 },
] };

describe("resumenPedido", () => {
  it("paso 4 del guion: $300 + $9 = $309", () => {
    expect(resumenPedido(guion, "Gratis", "Pro", { tipo: "recoger" })).toEqual({ subtotal: 300, descuento: 0, servicio: 9, servicioOriginal: 9, envio: 0, total: 309 });
  });
  it("Mercado+ no paga tarifa de servicio", () => expect(resumenPedido(guion, "Mercado+", "Pro", { tipo: "recoger" }).total).toBe(300));
  it("Pase Turista: 10% en puestos Pro o Plus, no en Gratis", () => {
    expect(resumenPedido(guion, "Pase Turista", "Pro", { tipo: "recoger" }).descuento).toBe(30);
    expect(resumenPedido(guion, "Pase Turista", "Plus", { tipo: "recoger" }).total).toBe(279);
    expect(resumenPedido(guion, "Pase Turista", "Gratis", { tipo: "recoger" }).descuento).toBe(0);
  });
  it("envío con terceros ±$10 por distancia", () => {
    expect(ajusteDistancia(1)).toBe(-10);
    expect(ajusteDistancia(5)).toBe(0);
    expect(ajusteDistancia(12)).toBe(10);
    expect(costoEnvio("rappi", 5)).toBe(49);
    expect(costoEnvio("uber", 1)).toBe(45);
    expect(costoEnvio("99", 20)).toBe(55);
    expect(resumenPedido(guion, "Gratis", "Pro", { tipo: "envio", proveedor: "rappi", distanciaKm: 5 }).total).toBe(358);
  });
});

describe("tarjeta", () => {
  it("Luhn acepta 4242… y rechaza números alterados", () => {
    expect(luhn("4242 4242 4242 4242")).toBe(true);
    expect(luhn("4242 4242 4242 4241")).toBe(false);
    expect(luhn("1234")).toBe(false);
  });
  it("vigencia MM/AA", () => {
    const hoy = new Date("2026-09-29T12:00:00Z");
    expect(vigenciaValida("09/26", hoy)).toBe(true);
    expect(vigenciaValida("08/26", hoy)).toBe(false);
    expect(vigenciaValida("13/30", hoy)).toBe(false);
    expect(vigenciaValida("1230", hoy)).toBe(false);
  });
  it("formatea en bloques", () => expect(formatearTarjeta("4242424242424242")).toBe("4242 4242 4242 4242"));
});

it("payload CoDi simulado lleva folio y monto", () => expect(payloadCoDi("BB-1234", 309, "x")).toContain("monto=309.00"));

describe("tarjeta de prueba", () => {
  it("solo acepta 4242 4242 4242 4242 (regla 5)", async () => {
    const { esTarjetaPrueba, luhn } = await import("@/lib/checkout");
    expect(esTarjetaPrueba("4242 4242 4242 4242")).toBe(true);
    // Una tarjeta válida por Luhn pero distinta no se acepta.
    expect(luhn("5555 5555 5555 4444")).toBe(true);
    expect(esTarjetaPrueba("5555 5555 5555 4444")).toBe(false);
  });
});
