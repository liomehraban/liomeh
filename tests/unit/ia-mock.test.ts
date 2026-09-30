import { describe, it, expect, vi, beforeEach } from "vitest";

// SDK simulado: cada prueba define qué devuelve parse().
const parse = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status = 500;
  }
  class Anthropic {
    static APIError = APIError;
    messages = { parse };
  }
  return { default: Anthropic };
});

const { datosAsistente } = await import("../../src/data/asistente");
const { construirContexto } = await import("../../src/lib/assistant/context");
const { responderConIA } = await import("../../src/lib/assistant/ia");
const { POST } = await import("../../src/app/api/asistente/route");

const d = await datosAsistente();
const ctx = construirContexto("pancita", d);
const msgs = [{ role: "user" as const, content: "¿Dónde como pancita?" }];

describe("con API key", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test");
    vi.stubEnv("ANTHROPIC_MODEL", "modelo-de-prueba");
    parse.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("usa la respuesta del modelo cuando es válida y pasa el modelo del env", async () => {
    parse.mockResolvedValue({ stop_reason: "end_turn", parsed_output: { text: "Ve con Doña Chela", cards: [{ tipo: "puesto", id: "pancita-dona-chela" }] } });
    expect(await responderConIA(msgs, ctx, d)).toEqual({ text: "Ve con Doña Chela", cards: [{ tipo: "puesto", id: "pancita-dona-chela" }] });
    expect(parse.mock.calls[0][0].model).toBe("modelo-de-prueba");
  });
  it("ids inexistentes → null (fallback)", async () => {
    parse.mockResolvedValue({ stop_reason: "end_turn", parsed_output: { text: "x", cards: [{ tipo: "puesto", id: "puesto-inventado" }] } });
    expect(await responderConIA(msgs, ctx, d)).toBeNull();
  });
  it("JSON roto (parse lanza) → null", async () => {
    parse.mockRejectedValue(new SyntaxError("Unexpected token"));
    expect(await responderConIA(msgs, ctx, d)).toBeNull();
  });
  it("rechazo del modelo → null", async () => {
    parse.mockResolvedValue({ stop_reason: "refusal", parsed_output: null });
    expect(await responderConIA(msgs, ctx, d)).toBeNull();
  });
  it("la ruta responde con el fallback por reglas sin romperse", async () => {
    parse.mockResolvedValue({ stop_reason: "end_turn", parsed_output: { text: "x", cards: [{ tipo: "mercado", id: "no-existe" }] } });
    const res = await POST(new Request("http://x/api/asistente", { method: "POST", body: JSON.stringify({ messages: msgs, locale: "es" }) }));
    const json = await res.json();
    expect(json.fuente).toBe("reglas");
    expect(json.cards[0]).toMatchObject({ tipo: "puesto", id: "pancita-dona-chela", titulo: "Pancita Doña Chela", mercadoId: "la-merced" });
  });
  it("cuerpo inválido → 400", async () => {
    const res = await POST(new Request("http://x/api/asistente", { method: "POST", body: JSON.stringify({ messages: [] }) }));
    expect(res.status).toBe(400);
  });
});
