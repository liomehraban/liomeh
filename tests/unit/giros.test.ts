import { describe, it, expect } from "vitest";
import { categoriaGiro, categoriaMercado } from "../../src/lib/giros";

describe("categoriaGiro", () => {
  it.each([
    ["comida", "comida"],
    ["Fonda / pancita", "comida"],
    ["Taquería", "comida"],
    ["flores", "flores"],
    ["Flores artificiales y fiesta", "flores"],
    ["plantas", "flores"],
    ["artesanías", "artesanias"],
    ["pescados y mariscos", "pescados"],
    ["Pescadería", "pescados"],
    ["Dulces mexicanos", "dulces"],
    ["mayoreo", "mayoreo"],
    ["abasto general", "frutas"],
    ["Frutas y verduras", "frutas"],
    ["ropa y calzado", "otros"],
    [undefined, "otros"],
  ] as const)("%s → %s", (giro, cat) => expect(categoriaGiro(giro)).toBe(cat));

  it("mercado sin giros pero mayorista → mayoreo", () =>
    expect(categoriaMercado({ giros: [], tipos: ["mayorista"] })).toBe("mayoreo"));
  it("usa el primer giro reconocible", () =>
    expect(categoriaMercado({ giros: ["ropa y calzado", "flores"], tipos: [] })).toBe("flores"));
});
