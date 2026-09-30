import { describe, it, expect } from "vitest";
import eventos from "../../data/eventos.json";
import { Eventos } from "../../src/lib/schemas";
import { agruparPorMes, categoriaAgenda, celdasMes, etiquetaEvento, eventosDelDia } from "../../src/lib/eventos";

const ev = Eventos.parse(eventos);
const e = (id: string) => ev.find((x) => x.id === id)!;
const oct1 = new Date("2026-10-01T18:00:00Z");
const oct10 = new Date("2026-10-10T18:00:00Z");

describe("agenda", () => {
  it("1 oct 2026: Feria del Mole «Próximo»; 10 oct: «En curso»", () => {
    expect(etiquetaEvento(e("mole-2026"), oct1)).toBe("proximo");
    expect(etiquetaEvento(e("mole-2026"), oct10)).toBe("en curso");
  });
  it("no confirmadas y futuras: «Fecha por confirmar»", () => {
    expect(etiquetaEvento(e("cempasuchil-jamaica"), oct10)).toBe("por confirmar");
    expect(etiquetaEvento(e("cempasuchil-jamaica"), new Date("2026-10-20T18:00:00Z"))).toBe("en curso");
  });
  it("recurrente = siempre", () => expect(etiquetaEvento(e("puerto-ciudad"), oct1)).toBe("siempre"));
  it("agrupa por mes y deja los recurrentes al final", () => {
    const g = agruparPorMes(ev, oct10);
    expect(g.meses[0][0]).toBe("2026-10");
    expect(g.meses[0][1].map((x) => x.id)).toContain("mole-2026");
    expect(g.siempre.map((x) => x.id)).toEqual(["puerto-ciudad"]);
    expect(g.meses.flatMap(([, xs]) => xs).every((x) => (x.fin ?? x.inicio) >= "2026-10-10")).toBe(true);
  });
  it("oculta los pasados", () => {
    const g = agruparPorMes(ev, new Date("2026-11-05T18:00:00Z"));
    expect(g.meses.flatMap(([, xs]) => xs).map((x) => x.id)).not.toContain("mole-2026");
  });
  it("categorías de filtro", () => {
    expect(categoriaAgenda("feria productores")).toBe("feria");
    expect(categoriaAgenda("productores")).toBe("feria");
    expect(categoriaAgenda("tradición")).toBe("tradicion");
  });
  it("calendario de octubre 2026 (empieza en jueves)", () => {
    const c = celdasMes(2026, 9);
    expect(c.slice(0, 4)).toEqual([null, null, null, "2026-10-01"]);
    expect(c.filter(Boolean)).toHaveLength(31);
    expect(eventosDelDia(ev, "2026-10-17").map((x) => x.id).sort()).toEqual(["alebrijes-2026", "cempasuchil-jamaica", "mole-2026"]);
  });
});
