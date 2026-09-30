import { describe, it, expect } from "vitest";
import { formatMXN, toUSD, formatUSDaprox } from "../../src/lib/money";
import { ratingPromedio, ratingsPorObjetivo } from "../../src/lib/resenas";
import { describirHorario, rangoDias, formatMinutos } from "../../src/lib/horarioTexto";

describe("money", () => {
  it("formatMXN sin decimales", () => {
    expect(formatMXN(1250)).toBe("$1,250");
    expect(formatMXN(309, "en")).toBe("$309");
  });
  it("toUSD con tipo de cambio", () => {
    expect(toUSD(185, 18.5)).toBe(10);
    expect(formatUSDaprox(309, 18.5)).toBe("≈ US$16.70");
  });
});

describe("resenas", () => {
  it("promedio a 1 decimal", () => expect(ratingPromedio([{ estrellas: 5 }, { estrellas: 4 }, { estrellas: 4 }])).toEqual({ promedio: 4.3, total: 3 }));
  it("sin reseñas → null", () => expect(ratingPromedio([])).toBeNull());
  it("agrupa por objetivo", () => {
    const base = { autor: "", origen: "", idioma: "es" as const, texto: "", fecha: "", verificada: "compra" as const, fotos: 0, simulado: true };
    const r = ratingsPorObjetivo([
      { ...base, id: "1", objetivo_id: "a", estrellas: 5 },
      { ...base, id: "2", objetivo_id: "a", estrellas: 3 },
      { ...base, id: "3", objetivo_id: "b", estrellas: 4 },
    ]);
    expect(r.a).toEqual({ promedio: 4, total: 2 });
    expect(r.b.total).toBe(1);
  });
});

describe("horarioTexto", () => {
  it("todos los días", () => expect(describirHorario({ texto: "", abre: "06:30", cierra: "18:00", dias: [0, 1, 2, 3, 4, 5, 6] }, "es")).toBe("Todos los días · 06:30–18:00"));
  it("24 h en inglés", () => expect(describirHorario({ texto: "", abre: "00:00", cierra: "23:59", dias: [0, 1, 2, 3, 4, 5, 6] }, "en")).toBe("Daily · 24 h"));
  it("rango con hueco (martes cerrado)", () => expect(rangoDias([0, 1, 3, 4, 5, 6], "es")).toBe("Lun, Mié–Dom"));
  it("rango en inglés", () => expect(rangoDias([1, 2, 3, 4, 5], "en")).toBe("Mon–Fri"));
  it("formatMinutos", () => {
    expect(formatMinutos(45)).toBe("45 min");
    expect(formatMinutos(135)).toBe("2 h 15 min");
    expect(formatMinutos(120)).toBe("2 h");
  });
});

import { combinarRating, resenaValida } from "../../src/lib/resenas";
import { precioRescate, toneladasRescatadas } from "../../src/lib/rescate";
describe("reseñas propias y rescate", () => {
  it("combina el rating del JSON con reseñas propias", () => {
    expect(combinarRating({ promedio: 4.7, total: 468 }, [])).toEqual({ promedio: 4.7, total: 468 });
    expect(combinarRating({ promedio: 5, total: 3 }, [{ estrellas: 1 }])).toEqual({ promedio: 4, total: 4 });
    expect(combinarRating(null, [{ estrellas: 4 }])).toEqual({ promedio: 4, total: 1 });
  });
  it("reseña: mínimo 20 caracteres", () => {
    expect(resenaValida({ estrellas: 5, texto: "Muy bueno" })).toBe(false);
    expect(resenaValida({ estrellas: 5, texto: "La pancita estaba riquísima, volveré." })).toBe(true);
    expect(resenaValida({ estrellas: 0, texto: "La pancita estaba riquísima, volveré." })).toBe(false);
  });
  it("rescate −40% y toneladas", () => {
    expect(precioRescate(28)).toBe(17);
    expect(toneladasRescatadas(37, 12)).toBe(37.012);
  });
});
