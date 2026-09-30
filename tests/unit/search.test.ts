import { describe, it, expect } from "vitest";
import { MockRepository } from "../../src/data/mock-repository";
import { buscar, crearIndice, documentosBusqueda, levenshtein, normalizar } from "../../src/lib/search";

const repo = new MockRepository();
const mercados = await repo.mercados();
const interior = (await repo.interior("la-merced"))!;
const productores = await repo.productores();
const indice = crearIndice(documentosBusqueda(mercados, { "la-merced": interior.puestos }, productores));
const ids = (q: string, tipo: "mercado" | "puesto" | "producto" | "productor") => buscar(indice, q)[tipo].map((r) => r.doc.id);

describe("search", () => {
  it("normaliza acentos", () => expect(normalizar("Xochimílco ÁRBOL")).toBe("xochimilco arbol"));
  it("levenshtein", () => {
    expect(levenshtein("pancita", "pansita")).toBe(1);
    expect(levenshtein("abc", "xyz", 1)).toBe(2);
  });
  it("«pancita» → La Merced y Pancita Doña Chela", () => {
    expect(ids("pancita", "mercado")).toContain("la-merced");
    expect(ids("pancita", "puesto")[0]).toBe("pancita-dona-chela");
  });
  it("«talavera» → La Ciudadela y San Juan Curiosidades", () => {
    const m = ids("talavera", "mercado");
    expect(m).toContain("la-ciudadela");
    expect(m).toContain("86-san-juan-curiosidades");
  });
  it("«nopal» → Centro de Acopio y productores de Milpa Alta", () => {
    expect(ids("nopal", "mercado")[0]).toBe("centro-acopio-nopal-milpa-alta");
    const p = buscar(indice, "nopal").productor.map((r) => r.doc);
    expect(p.length).toBeGreaterThan(0);
    expect(p.every((d) => d.subtitulo?.includes("Milpa Alta"))).toBe(true);
  });
  it("tolera errores y acentos: «xochimlco», «panzita», «dona tere»", () => {
    expect(ids("xochimlco", "mercado")).toContain("44-xochimilco-zona-xochitl");
    expect(ids("panzita", "puesto")).toContain("pancita-dona-chela");
    expect(ids("dona tere", "puesto")[0]).toBe("dona-tere");
  });
  it("sin falsos positivos difusos: «pancita» no trae Pantitlán ni Santa Anita", () => {
    const m = ids("pancita", "mercado").join(" ");
    expect(m).not.toMatch(/pantitlan|santa-anita/);
  });
  it("el nombre pesa más que el texto libre", () => {
    expect(ids("jamaica", "mercado").slice(0, 2).sort()).toEqual(["235-jamaica-nuevo", "65-jamaica-comidas"]);
  });
  it("consulta vacía no devuelve nada", () => expect(Object.values(buscar(indice, "  ")).flat()).toHaveLength(0));
});

describe("productos del catálogo simulado", () => {
  it("encuentra un mercado por un producto de su catálogo simulado", () => {
    const otro = mercados.find((m) => m.id !== "la-merced")!;
    const idx = crearIndice(documentosBusqueda(mercados, {}, productores, { [otro.id]: ["Pitahaya amarilla"] }));
    expect(buscar(idx, "pitahaya").mercado.map((r) => r.doc.id)).toContain(otro.id);
  });
});
