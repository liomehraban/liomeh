import { describe, it, expect } from "vitest";
import huertos from "../../data/huertos.json";
import { precioJusto, productoCorto } from "../../src/lib/fairtrade";

const jurado = huertos.productores.find((p) => p.id === "prod-milpa-01")!;

describe("fairtrade", () => {
  it("Familia Jurado: $70 vs $35 de $150, «el doble»", () => {
    const f = precioJusto(jurado);
    expect(f).toMatchObject({ precio: 150, recibe: 70, antes: 35, pctApp: 47, pctIntermediarios: 23, esDoble: true, unidad: "ciento" });
  });
  it("esDoble solo si mejora_pct ≥ 95", () => {
    for (const p of huertos.productores) expect(precioJusto(p).esDoble).toBe(p.comercio_justo.mejora_pct >= 95);
  });
  it("productoCorto", () => {
    expect(productoCorto("Nopal verdura")).toBe("nopal");
    expect(productoCorto("Brócoli y coliflor")).toBe("brócoli");
  });
});
