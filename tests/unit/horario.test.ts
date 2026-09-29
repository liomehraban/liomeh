import { describe, it, expect } from "vitest";
import { estadoHorario } from "../../src/lib/horario";

// Fechas en UTC; CDMX = UTC-6 (sin horario de verano desde 2022).
const at = (iso: string) => new Date(iso);
const merced = { texto: "", abre: "06:30", cierra: "18:00", dias: [0, 1, 2, 3, 4, 5, 6] };
const granaditas = { texto: "", abre: "09:00", cierra: "18:00", dias: [0, 1, 3, 4, 5, 6] }; // martes cerrado
const jamaica = { texto: "", abre: "00:00", cierra: "23:59", dias: [0, 1, 2, 3, 4, 5, 6] };
const noche = { texto: "", abre: "22:00", cierra: "04:00", dias: [5, 6] }; // vie y sáb, cruza medianoche

describe("estadoHorario", () => {
  it("abierto a media mañana", () => expect(estadoHorario(merced, at("2026-10-01T16:00:00Z")).estado).toBe("abierto")); // 10:00 CDMX
  it("cerrado antes de abrir", () => expect(estadoHorario(merced, at("2026-10-01T12:00:00Z")).estado).toBe("cerrado")); // 06:00
  it("cerrado a la hora exacta de cierre", () => expect(estadoHorario(merced, at("2026-10-02T00:00:00Z")).estado).toBe("cerrado")); // 18:00
  it("martes cerrado en Granaditas", () => expect(estadoHorario(granaditas, at("2026-09-29T17:00:00Z")).estado).toBe("cerrado")); // mar 11:00
  it("24 horas siempre abierto", () => expect(estadoHorario(jamaica, at("2026-10-01T09:30:00Z")).estado).toBe("abierto"));
  it("cruza medianoche: sábado 01:00 abierto (viene del viernes)", () => expect(estadoHorario(noche, at("2026-10-03T07:00:00Z")).estado).toBe("abierto"));
  it("sin horario → desconocido", () => expect(estadoHorario(undefined).estado).toBe("desconocido"));
});
