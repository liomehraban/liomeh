import { describe, it, expect, afterEach, vi } from "vitest";
import { datosAsistente } from "../../src/data/asistente";
import { construirContexto } from "../../src/lib/assistant/context";
import { iaDisponible, responderConIA, systemPrompt, validarSalida } from "../../src/lib/assistant/ia";

const d = await datosAsistente();

describe("salida del modelo", () => {
  it("acepta JSON válido con ids existentes", () =>
    expect(validarSalida({ text: "¡Pásele!", cards: [{ tipo: "puesto", id: "dona-tere" }] }, d)).toEqual({ text: "¡Pásele!", cards: [{ tipo: "puesto", id: "dona-tere" }] }));
  it("rechaza ids inexistentes", () => expect(validarSalida({ text: "x", cards: [{ tipo: "mercado", id: "mercado-inventado" }] }, d)).toBeNull());
  it("rechaza tipos cruzados (un puesto como mercado)", () => expect(validarSalida({ text: "x", cards: [{ tipo: "mercado", id: "dona-tere" }] }, d)).toBeNull());
  it("rechaza más de 3 tarjetas", () => expect(validarSalida({ text: "x", cards: Array(4).fill({ tipo: "mercado", id: "la-merced" }) }, d)).toBeNull());
  it("rechaza JSON roto o vacío", () => {
    expect(validarSalida(null, d)).toBeNull();
    expect(validarSalida({ texto: "hola" }, d)).toBeNull();
    expect(validarSalida({ text: "  ", cards: [] }, d)).toBeNull();
  });
});

describe("configuración", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("sin key o sin modelo no llama a la API", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("ANTHROPIC_MODEL", "");
    expect(iaDisponible()).toBe(false);
    expect(await responderConIA([{ role: "user", content: "hola" }], construirContexto("hola", d), d)).toBeNull();
  });
  it("el system prompt incluye la hora y el contexto", () => {
    const c = construirContexto("pancita", d);
    const s = systemPrompt("jueves 1 de octubre de 2026, 10:00", c);
    expect(s).toContain("Eres Marchanta");
    expect(s).toContain("jueves 1 de octubre de 2026, 10:00");
    expect(s).toContain("pancita-dona-chela");
  });
});
