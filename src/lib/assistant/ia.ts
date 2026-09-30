/**
 * Llamada al modelo (solo servidor). Si faltan ANTHROPIC_API_KEY o ANTHROPIC_MODEL devuelve null;
 * cualquier error, rechazo o respuesta inválida (JSON roto, ids inexistentes) también devuelve null
 * y la ruta usa el fallback por reglas.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { cardValida } from "./cards";
import type { Contexto } from "./context";
import { Card, RespuestaModelo, type DatosAsistente } from "./types";

/** System prompt de docs/05_modulos.md §M22. */
export function systemPrompt(ahora: string, contexto: Contexto): string {
  return `Eres Marchanta, la asistente de Pásele, la app de los mercados públicos de la Ciudad de México. Hablas cálido, breve y claro, en el idioma del usuario (español mexicano o inglés). Solo recomiendas mercados, puestos, productores, eventos y rutas que aparezcan en el CONTEXTO; si algo no está, dilo y sugiere la alternativa más cercana del contexto. Nunca inventes horarios, precios ni direcciones. Considera la hora actual en CDMX (${ahora}) para decir si algo está abierto. Responde SOLO en JSON: {"text": string (máx. 90 palabras), "cards": [{"tipo":"mercado|puesto|productor|evento|ruta","id": string}] (máx. 3)}.
CONTEXTO: ${JSON.stringify(contexto)}`;
}

/** Esquema que se le pide al modelo; el límite de 3 tarjetas se valida después con RespuestaModelo. */
const SalidaModelo = z.object({ text: z.string(), cards: z.array(Card) });

export type MensajeChat = { role: "user" | "assistant"; content: string };

/** Valida la salida: JSON conforme, ≤ 3 tarjetas y todos los ids existentes. */
export function validarSalida(salida: unknown, d: DatosAsistente): RespuestaModelo | null {
  const r = RespuestaModelo.safeParse(salida);
  if (!r.success || !r.data.text.trim()) return null;
  if (!r.data.cards.every((c) => cardValida(c, d))) return null;
  return r.data;
}

export function iaDisponible(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && !!process.env.ANTHROPIC_MODEL;
}

export async function responderConIA(mensajes: MensajeChat[], contexto: Contexto, d: DatosAsistente): Promise<RespuestaModelo | null> {
  const model = process.env.ANTHROPIC_MODEL;
  if (!process.env.ANTHROPIC_API_KEY || !model) return null;
  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
    const response = await client.messages.parse({
      model,
      max_tokens: 4096,
      system: systemPrompt(contexto.ahora, contexto),
      messages: mensajes,
      output_config: { format: zodOutputFormat(SalidaModelo) },
    });
    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") return null;
    return validarSalida(response.parsed_output, d);
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error(`[asistente] API ${error.status}: ${error.message}`);
    else console.error("[asistente] respuesta inválida del modelo; se usa el fallback", error);
    return null;
  }
}
