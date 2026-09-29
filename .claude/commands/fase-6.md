---
description: Fase 6 · Asistente Marchanta 24/7 (M22)
---

# Fase 6 · Asistente Marchanta 24/7 (M22)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/02_arquitectura.md §Asistente AI y docs/05_modulos.md M22 (el system prompt está ahí).

1. UI de chat en `/asistente`: avatar SVG de Marchanta, chips, input, micrófono (Web Speech API si existe), «escribiendo…», tarjetas accionables y límite diario según el plan.
2. `lib/assistant/intents.ts`: fallback por reglas para las 8 intenciones, ES y EN, usando el repositorio, `estadoHorario()`, distancias y fechas reales. Tests: cada intención × idioma devuelve ids existentes.
3. `lib/assistant/context.ts`: recorte de contexto (15–25 registros relevantes + eventos de los próximos 30 días).
4. `app/api/asistente/route.ts`: si `ANTHROPIC_API_KEY` y `ANTHROPIC_MODEL` existen, llama a la Messages API (SDK oficial `@anthropic-ai/sdk`) pidiendo JSON y valida con zod (texto + ≤3 cards con ids existentes). Ante cualquier error, usa el fallback. Nunca expongas la key al cliente.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
