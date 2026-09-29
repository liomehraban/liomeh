---
description: Fase 4 · Mapa de huertos (M6)
---

# Fase 4 · Mapa de huertos (M6)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/05_modulos.md M6 y M7, docs/03_datos.md §Huertos (¡invertir las coordenadas del polígono!).

1. `/huertos`: capa de polígonos (fill + outline), pines de productor, toggle «Mostrar mercados», chips de cultivo y el filtro «De temporada ahora».
2. Ficha de zona (bottom sheet) y `/huertos/[productorId]` completa: compra al mayoreo (puntos dobles), reserva de visita y reseñas.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
