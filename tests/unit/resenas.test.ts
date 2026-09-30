import { describe, expect, it } from "vitest";


describe("verificación y puntos de reseñas", () => {
  it("solo verifica con compra o check-in en ese lugar", async () => {
    const { verificacionResena, puntosPorResena } = await import("@/lib/resenas");
    const vacio = { checkins: [], pedidos: [] };
    expect(verificacionResena("la-merced", vacio)).toBeUndefined();
    expect(verificacionResena("la-merced", { checkins: [], pedidos: [{ puestoId: "pancita-dona-chela", mercadoId: "la-merced" }] })).toBe("compra");
    expect(verificacionResena("jugos-moreno", { checkins: [{ objetivo: "jugos-moreno", mercadoId: "la-merced" }], pedidos: [] })).toBe("check-in QR");
    expect(verificacionResena("x", { checkins: [{ objetivo: "mercado:x", mercadoId: "x" }], pedidos: [] })).toBe("check-in QR");
    expect(puntosPorResena(false, true)).toBe(15);
    expect(puntosPorResena(true, true)).toBe(0);
    expect(puntosPorResena(false, false)).toBe(0);
  });
});
