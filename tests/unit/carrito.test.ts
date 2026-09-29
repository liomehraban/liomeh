import { describe, it, expect } from "vitest";
import { agregarItem, cambiarCantidad, piezasCarrito, requiereNuevoPedido, subtotalGrupo } from "../../src/lib/carrito";

const pancita = { nombre: "Pancita", precio: 115, unidad: "plato", qty: 2 };
const sope = { nombre: "Sope", precio: 35, unidad: "pieza", qty: 2 };

describe("carrito", () => {
  it("agrega y suma cantidades del mismo producto", () => {
    let c = agregarItem([], "chela", pancita);
    c = agregarItem(c, "chela", { ...pancita, qty: 1 });
    expect(c).toHaveLength(1);
    expect(c[0].items[0].qty).toBe(3);
  });
  it("un grupo por puesto: otro puesto abre otro grupo", () => {
    let c = agregarItem([], "chela", pancita);
    expect(requiereNuevoPedido(c, "chela")).toBe(false);
    expect(requiereNuevoPedido(c, "tere")).toBe(true);
    expect(requiereNuevoPedido([], "tere")).toBe(false);
    c = agregarItem(c, "tere", sope);
    expect(c.map((l) => l.puestoId)).toEqual(["chela", "tere"]);
  });
  it("subtotal del paso 4 del guion: 2×115 + 2×35 = 300", () => {
    const c = agregarItem(agregarItem([], "chela", pancita), "chela", sope);
    expect(subtotalGrupo(c[0])).toBe(300);
    expect(piezasCarrito(c)).toBe(4);
  });
  it("cantidad 0 quita el producto y el grupo vacío", () => {
    const c = agregarItem([], "chela", pancita);
    expect(cambiarCantidad(c, "chela", "Pancita", 0)).toEqual([]);
    expect(cambiarCantidad(c, "chela", "Pancita", 5)[0].items[0].qty).toBe(5);
  });
  it("ignora cantidades no positivas", () => expect(agregarItem([], "chela", { ...pancita, qty: 0 })).toEqual([]));
});
