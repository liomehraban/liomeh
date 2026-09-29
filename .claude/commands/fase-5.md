---
description: Fase 5 · Reseñas, Pasaporte, Agenda, Rutas, Planes y Rescata hoy (M8–M12, M20)
---

# Fase 5 · Reseñas, Pasaporte, Agenda, Rutas, Planes y Rescata hoy (M8–M12, M20)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/05_modulos.md M8, M9, M10, M11, M12 y M20, y data/lealtad.json, eventos.json y rutas_experiencias.json.

Implementa los seis módulos con todos sus AC. Puntos clave:
- El check-in QR respeta 1 por puesto al día; el primero en un mercado da un sello.
- Insignias con reglas evaluadas en `lib/loyalty.ts` (con tests).
- Agenda: estados En curso / Próximo / Por confirmar calculados con la fecha actual en CDMX (tests con fechas fijas: 1 y 10 de octubre de 2026).
- Paywall de rutas premium → Planes; el plan afecta tarifa, descuento, asistente y rutas.
- Rescata hoy suma kg al store y alimenta el KPI de SEDEMA.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
