---
description: Fase 6 · Asistente Marchanta 24/7 (M22)
---

# Fase 6 · Asistente Marchanta 24/7 (M22)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/02_arquitectura.md §Asistente Marchanta y docs/05_modulos.md M22.

> Decisión de producto: Marchanta es **simulada**, sin API de IA ni texto libre.

1. UI en `/asistente`: avatar SVG de Marchanta, ocho preguntas rápidas en chips, «escribiendo…», tarjetas accionables y límite diario según el plan.
2. `lib/assistant/intents.ts`: respuesta por reglas para las 8 intenciones, ES y EN, usando el repositorio, `estadoHorario()`, distancias y fechas reales. Tests: cada intención × idioma devuelve ids existentes.
3. Las respuestas se calculan en el servidor (`src/data/respuestas-asistente.ts`) y la página se regenera cada 15 min.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
