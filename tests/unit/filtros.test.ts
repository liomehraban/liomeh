import { describe, it, expect } from "vitest";
import { MockRepository } from "../../src/data/mock-repository";
import { filtrarMercados, FILTROS_VACIOS } from "../../src/lib/filtros";
import { estadoHorario } from "../../src/lib/horario";

const mercados = await new MockRepository().mercados();
const miercoles10am = new Date("2026-09-30T16:00:00Z"); // 10:00 CDMX
const madrugada = new Date("2026-09-30T09:00:00Z"); // 03:00 CDMX

describe("filtrarMercados", () => {
  it("sin filtros devuelve los 346", () => expect(filtrarMercados(mercados, FILTROS_VACIOS)).toHaveLength(346));

  it("alcaldía Xochimilco deja solo Xochimilco", () => {
    const r = filtrarMercados(mercados, { ...FILTROS_VACIOS, alcaldias: ["Xochimilco"] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((m) => m.alcaldia === "Xochimilco")).toBe(true);
    expect(r).toHaveLength(mercados.filter((m) => m.alcaldia === "Xochimilco").length);
  });

  it("«Abierto ahora» usa estadoHorario y excluye mercados sin horario", () => {
    const r = filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["abierto"] }, miercoles10am);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((m) => m.horario && estadoHorario(m.horario, miercoles10am).estado === "abierto")).toBe(true);
    const deMadrugada = filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["abierto"] }, madrugada);
    expect(deMadrugada.length).toBeLessThan(r.length);
  });

  it("destacados = 22", () => expect(filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["destacados"] })).toHaveLength(22));

  it("chips de giro se combinan con OR", () => {
    const flores = filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["flores"] });
    const pescados = filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["pescados"] });
    const ambos = filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["flores", "pescados"] });
    expect(ambos.length).toBe(new Set([...flores, ...pescados]).size);
    expect(pescados.map((m) => m.id)).toContain("la-nueva-viga");
  });

  it("mayoreo incluye mayoristas (CEDA)", () =>
    expect(filtrarMercados(mercados, { ...FILTROS_VACIOS, chips: ["mayoreo"] }).map((m) => m.id)).toContain("central-de-abasto"));

  it("tipo turístico", () => {
    const r = filtrarMercados(mercados, { ...FILTROS_VACIOS, tipos: ["turístico"] });
    expect(r.every((m) => m.tipos.includes("turístico"))).toBe(true);
  });
});
