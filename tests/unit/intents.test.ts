import { describe, it, expect } from "vitest";
import { datosAsistente } from "../../src/data/asistente";
import { cardValida, resolverTarjetas } from "../../src/lib/assistant/cards";
import { detectarIntencion, responderSinIA } from "../../src/lib/assistant/intents";
import type { Intencion } from "../../src/lib/assistant/types";

const d = await datosAsistente();
const now = new Date("2026-10-01T16:00:00Z"); // jueves 1 oct, 10:00 CDMX

const CASOS: { intencion: Intencion; es: string; en: string; tipo: string }[] = [
  { intencion: "comida", es: "¿Dónde como pancita cerca?", en: "Where can I eat pancita nearby?", tipo: "puesto" },
  { intencion: "abierto", es: "¿Qué mercado está abierto ahora?", en: "Which market is open now?", tipo: "mercado" },
  { intencion: "llegar", es: "¿Cómo llego con Doña Tere?", en: "How do I get to Doña Tere?", tipo: "puesto" },
  { intencion: "productor", es: "Quiero comprar nopal directo al productor", en: "I want to buy nopal directly from a grower", tipo: "productor" },
  { intencion: "eventos", es: "¿Qué eventos hay este mes?", en: "What events are on this month?", tipo: "evento" },
  { intencion: "artesanias", es: "Busco artesanías de talavera", en: "Where can I find crafts like talavera?", tipo: "mercado" },
  { intencion: "comercioJusto", es: "¿Qué es el comercio justo en la app?", en: "What does fair trade mean in the app?", tipo: "productor" },
  { intencion: "puntos", es: "¿Cómo funcionan los puntos y el check-in en efectivo?", en: "How do points and cash check-in work?", tipo: "ruta" },
];

describe("intents (fallback sin API key)", () => {
  for (const c of CASOS) {
    for (const loc of ["es", "en"] as const) {
      it(`${c.intencion} · ${loc}`, () => {
        const msg = loc === "es" ? c.es : c.en;
        expect(detectarIntencion(msg)).toBe(c.intencion);
        const r = responderSinIA(msg, d, { locale: loc, now });
        expect(r.intencion).toBe(c.intencion);
        expect(r.text.length).toBeGreaterThan(20);
        expect(r.cards.length).toBeGreaterThan(0);
        expect(r.cards.length).toBeLessThanOrEqual(3);
        for (const card of r.cards) expect(cardValida(card, d), `${card.tipo}:${card.id}`).toBe(true);
        expect(r.cards[0].tipo).toBe(c.tipo);
        expect(resolverTarjetas(r.cards, d, loc)).toHaveLength(r.cards.length);
      });
    }
  }

  it("«How do I get to Doña Tere?» → puesto dona-tere", () => {
    expect(responderSinIA("How do I get to Doña Tere?", d, { locale: "en", now }).cards).toEqual([{ tipo: "puesto", id: "dona-tere" }]);
    expect(responderSinIA("¿Dónde está Pancita Doña Chela?", d, { locale: "es", now }).cards[0]).toEqual({ tipo: "puesto", id: "pancita-dona-chela" });
  });

  it("«eventos este mes» el 1 oct incluye la Feria Nacional del Mole (3–25 oct)", () => {
    const r = responderSinIA("¿Qué eventos hay este mes?", d, { locale: "es", now });
    expect(r.cards[0]).toEqual({ tipo: "evento", id: "mole-2026" });
    expect(r.text).toContain("3–25 oct");
  });

  it("«abierto 24 horas» solo devuelve mercados 24 h", () => {
    const r = responderSinIA("¿Qué mercado abre 24 horas?", d, { locale: "es", now: new Date("2026-10-01T09:00:00Z") });
    expect(r.cards.map((c) => c.id)).toEqual(expect.arrayContaining(["central-de-abasto"]));
  });

  it("platillos: huaraches, carnitas, mariscos y quesadillas dan tarjetas válidas", () => {
    for (const q of ["huaraches", "carnitas", "mariscos", "quesadillas"]) {
      const r = responderSinIA(`¿Dónde como ${q}?`, d, { locale: "es", now });
      expect(r.intencion).toBe("comida");
      expect(r.cards.length).toBeGreaterThan(0);
      r.cards.forEach((c) => expect(cardValida(c, d)).toBe(true));
    }
  });

  it("artesanías: talavera → La Ciudadela y San Juan Curiosidades", () => {
    const ids = responderSinIA("Busco artesanías de talavera", d, { locale: "es", now }).cards.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["la-ciudadela", "86-san-juan-curiosidades"]));
  });

  it("sin intención clara responde ayuda sin tarjetas", () => {
    const r = responderSinIA("hola", d, { locale: "es", now });
    expect(r.intencion).toBe("ayuda");
    expect(r.cards).toEqual([]);
  });
});
