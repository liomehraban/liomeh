/**
 * Marchanta simulada: las preguntas rápidas y sus respuestas se calculan en el servidor con las
 * reglas de `lib/assistant/intents.ts` sobre los datos reales. El cliente no hace ninguna llamada.
 */
import { resolverTarjetas } from "@/lib/assistant/cards";
import { responderSinIA } from "@/lib/assistant/intents";
import type { Locale, RespuestaAsistente } from "@/lib/assistant/types";
import { datosAsistente } from "./asistente";

export type PreguntaRapida = { pregunta: string; respuesta: RespuestaAsistente };

export async function respuestasPreguardadas(preguntas: string[], locale: Locale, now = new Date()): Promise<PreguntaRapida[]> {
  const d = await datosAsistente();
  return preguntas.map((pregunta) => {
    const r = responderSinIA(pregunta, d, { locale, now });
    return { pregunta, respuesta: { text: r.text, cards: resolverTarjetas(r.cards, d, locale), intencion: r.intencion } };
  });
}
