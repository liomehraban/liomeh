import { describe, it, expect } from "vitest";
import { construirPedido, etapaActual, etapas, nuevoFolio } from "../../src/lib/pedidos";

const resumen = { subtotal: 300, descuento: 0, servicio: 9, servicioOriginal: 9, envio: 0, total: 309 };
const base = {
  puestoId: "pancita-dona-chela",
  mercadoId: "la-merced",
  items: [{ nombre: "Pancita", precio: 115, unidad: "plato", qty: 2 }, { nombre: "Sope", precio: 35, unidad: "pieza", qty: 2 }],
  resumen,
  metodo: "qr" as const,
  entrega: "recoger" as const,
};

describe("pedidos", () => {
  it("folio BB-XXXX sin colisiones", () => {
    expect(nuevoFolio([])).toMatch(/^BB-\d{4}$/);
    let i = 0;
    const seq = [0.1, 0.1, 0.5];
    expect(nuevoFolio(["BB-1900"], () => seq[i++])).toBe("BB-5500");
  });
  it("paso 4: $309 → 30 puntos", () => {
    const p = construirPedido(base, []);
    expect(p.total).toBe(309);
    expect(p.puntos).toBe(30);
    expect(p.dobles).toBe(false);
  });
  it("puntos dobles si algún ítem viene de un huerto", () => {
    const p = construirPedido({ ...base, items: [...base.items, { nombre: "Nopal", precio: 30, unidad: "kg", qty: 1, huertoId: "prod-milpa-01" }] }, []);
    expect(p.puntos).toBe(60);
  });
  it("el pedido no guarda datos de tarjeta completos", () => {
    const p = construirPedido({ ...base, metodo: "tarjeta", tarjetaUltimos4: "4242" }, []);
    expect(JSON.stringify(p)).not.toMatch(/\d{12,}/);
  });
  it("timeline avanza cada 8 s y se detiene al final", () => {
    const fecha = "2026-10-01T16:00:00.000Z";
    const t = (s: number) => new Date(new Date(fecha).getTime() + s * 1000);
    expect(etapaActual({ fecha, entrega: "recoger" }, t(0))).toBe(0);
    expect(etapaActual({ fecha, entrega: "recoger" }, t(8))).toBe(1);
    expect(etapaActual({ fecha, entrega: "recoger" }, t(999))).toBe(2);
    expect(etapas("envio")).toEqual(["pagado", "preparando", "en ruta", "entregado"]);
    expect(etapaActual({ fecha, entrega: "envio" }, t(999))).toBe(3);
  });
});
