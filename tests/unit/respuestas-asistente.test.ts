import { describe, expect, it } from "vitest";

import es from "../../messages/es.json";
import en from "../../messages/en.json";
import { respuestasPreguardadas } from "@/data/respuestas-asistente";

const now = new Date("2026-10-01T18:00:00-06:00");

describe("Marchanta simulada: preguntas rápidas", () => {
  it.each([
    ["es", es.asistente.chips],
    ["en", en.asistente.chips],
  ] as const)("%s: cada botón tiene respuesta, con una intención distinta y tarjetas válidas", async (locale, chips) => {
    const r = await respuestasPreguardadas([...chips], locale, now);
    expect(r).toHaveLength(8);
    expect(new Set(r.map((x) => x.respuesta.intencion)).size).toBe(8);
    expect(r.every((x) => x.respuesta.text.length > 20)).toBe(true);
    for (const x of r) for (const c of x.respuesta.cards) expect(c.titulo).toBeTruthy();
  });

  it("«eventos este mes» trae la Feria Nacional del Mole con su tarjeta", async () => {
    const [r] = await respuestasPreguardadas(["¿Qué eventos hay este mes?"], "es", now);
    expect(r.respuesta.intencion).toBe("eventos");
    expect(r.respuesta.cards.map((c) => c.id)).toContain("mole-2026");
  });
});
