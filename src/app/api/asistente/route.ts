import { z } from "zod";

import { datosAsistente } from "@/data/asistente";
import { resolverTarjetas } from "@/lib/assistant/cards";
import { construirContexto } from "@/lib/assistant/context";
import { responderConIA } from "@/lib/assistant/ia";
import { responderSinIA } from "@/lib/assistant/intents";
import type { RespuestaAsistente } from "@/lib/assistant/types";

const Cuerpo = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(20)
    .refine((m) => m.at(-1)?.role === "user", "El último mensaje debe ser del usuario"),
  locale: z.enum(["es", "en"]).default("es"),
  perfil: z.string().optional(),
  ubicacion: z.object({ lat: z.number(), lng: z.number() }).nullish(),
});

/**
 * M22 · POST /api/asistente → { text, cards, fuente }.
 * Con ANTHROPIC_API_KEY + ANTHROPIC_MODEL usa la Messages API; si no, o ante cualquier fallo, el fallback por reglas.
 * La key vive solo en el servidor.
 */
export async function POST(request: Request) {
  let body: z.infer<typeof Cuerpo>;
  try {
    body = Cuerpo.parse(await request.json());
  } catch {
    return Response.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const d = await datosAsistente();
  const now = new Date();
  const ultimo = body.messages.at(-1)!.content;
  const historial = body.messages.slice(-10);

  const ia = await responderConIA(historial, construirContexto(ultimo, d, now, body.ubicacion), d);
  const respuesta: RespuestaAsistente = ia
    ? { text: ia.text, cards: resolverTarjetas(ia.cards, d, body.locale), fuente: "ia" }
    : (() => {
        const r = responderSinIA(ultimo, d, { locale: body.locale, now, ubicacion: body.ubicacion });
        return { text: r.text, cards: resolverTarjetas(r.cards, d, body.locale), fuente: "reglas" as const, intencion: r.intencion };
      })();

  return Response.json(respuesta, { headers: { "Cache-Control": "no-store" } });
}
