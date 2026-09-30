import { describe, it, expect } from "vitest";
import { MockRepository } from "../../src/data/mock-repository";
import { ratingPromedio } from "../../src/lib/resenas";

const repo = new MockRepository();

describe("MockRepository", () => {
  it("346 mercados, 22 destacados", async () => {
    expect(await repo.mercados()).toHaveLength(346);
    expect(await repo.mercados({ destacados: true })).toHaveLength(22);
  });
  it("filtro de alcaldía", async () => {
    const xochi = await repo.mercados({ alcaldias: ["Xochimilco"] });
    expect(xochi.length).toBeGreaterThan(0);
    expect(xochi.every((m) => m.alcaldia === "Xochimilco")).toBe(true);
  });
  it("interior solo para la-merced", async () => {
    expect(await repo.interior("la-merced")).not.toBeNull();
    expect(await repo.interior("la-ciudadela")).toBeNull();
  });
  it("puesto y productor por id", async () => {
    expect((await repo.puesto("pancita-dona-chela"))?.nombre).toMatch(/Chela/);
    expect((await repo.productor("prod-xochi-01"))?.titular).toMatch(/Lucía Romero/);
    expect(await repo.mercado("no-existe")).toBeNull();
  });
  it("eventos: oculta pasados y deja recurrentes al final", async () => {
    const ev = await repo.eventos(new Date("2026-10-01T18:00:00Z"));
    expect(ev.every((e) => e.inicio === "recurrente" || (e.fin ?? e.inicio) >= "2026-10-01")).toBe(true);
    const i = ev.findIndex((e) => e.inicio === "recurrente");
    if (i >= 0) expect(ev.slice(i).every((e) => e.inicio === "recurrente")).toBe(true);
  });
});

describe("consultas agregadas", () => {
  const r = new MockRepository();
  it("ratings coincide con el promedio de las reseñas de cada objetivo", async () => {
    const ratings = await r.ratings();
    for (const m of (await r.mercados()).slice(0, 40)) expect(ratings[m.id] ?? null).toEqual(ratingPromedio(await r.resenas(m.id)));
  });
  it("puestosEnLinea trae los puestos del interior con su mercado", async () => {
    const enLinea = await r.puestosEnLinea();
    const interior = (await r.interior("la-merced"))!;
    expect(enLinea.map((x) => x.puesto.id)).toEqual(interior.puestos.map((p) => p.id));
    expect(new Set(enLinea.map((x) => x.mercado.id))).toEqual(new Set(["la-merced"]));
  });
  it("productosPorMercado cubre todos los mercados sin repetir nombres", async () => {
    const prods = await r.productosPorMercado();
    const mercados = await r.mercados();
    expect(Object.keys(prods)).toHaveLength(mercados.length);
    for (const lista of Object.values(prods)) expect(new Set(lista).size).toBe(lista.length);
  });
  it("productores filtra por ids", async () => {
    const [a, b] = await r.productores();
    expect((await r.productores({ ids: [b.id] })).map((p) => p.id)).toEqual([b.id]);
    expect(a.id).not.toBe(b.id);
  });
});
