import { describe, it, expect } from "vitest";
import { estadoEvento, eventosVigentes, formatRangoFechas, hoyCDMX } from "../../src/lib/eventos";

const mole = { inicio: "2026-10-03", fin: "2026-10-25" };
const cdmx = (iso: string) => new Date(`${iso}T18:00:00Z`); // mediodía CDMX

describe("eventos", () => {
  it("Feria del Mole: 1 oct → próximo; 3 y 25 oct → en curso; 26 oct → pasado", () => {
    expect(estadoEvento(mole, cdmx("2026-10-01"))).toBe("proximo");
    expect(estadoEvento(mole, cdmx("2026-10-03"))).toBe("en curso");
    expect(estadoEvento(mole, cdmx("2026-10-25"))).toBe("en curso");
    expect(estadoEvento(mole, cdmx("2026-10-26"))).toBe("pasado");
  });
  it("recurrente = siempre y va al final", () => {
    const r = eventosVigentes([{ inicio: "recurrente", fin: null }, mole, { inicio: "2026-01-01", fin: "2026-01-02" }], cdmx("2026-10-01"));
    expect(r).toHaveLength(2);
    expect(r.at(-1)!.inicio).toBe("recurrente");
  });
  it("hoyCDMX usa la zona de la CDMX (UTC-6)", () => expect(hoyCDMX(new Date("2026-10-02T03:00:00Z"))).toBe("2026-10-01"));
  it("formatRangoFechas", () => {
    expect(formatRangoFechas("2026-10-03", "2026-10-25")).toBe("3–25 oct");
    expect(formatRangoFechas("2026-10-03", "2026-10-25", "en")).toBe("Oct 3–25");
    expect(formatRangoFechas("2026-10-31", "2026-11-02")).toBe("31 oct – 2 nov");
    expect(formatRangoFechas("2026-10-17", "2026-10-17")).toBe("17 oct");
    expect(formatRangoFechas("2026-12-15", "2027-01-06")).toMatch(/15 dic 2026 – 6 ene 2027/);
  });
});
