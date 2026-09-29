---
description: Fase 8 · Panel de gobierno, modo presentación, PWA, e2e y deploy
---

# Fase 8 · Panel de gobierno, modo presentación, PWA, e2e y deploy

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/05_modulos.md M19 y «Modo presentación», docs/06_demo.md y docs/02_arquitectura.md §PWA y §Deploy.

1. **M19** `/gobierno` con layout ancho, KPIs, mapa de adopción por alcaldía, series, pestañas por secretaría (SEDEMA suma lo rescatado en M20), top de mercados y exportar CSV.
2. `/presentacion`: guion de 10 pasos que navega y ejecuta acciones con animación, barra de progreso, «Siguiente» y «Reiniciar demo».
3. PWA con Serwist: manifest, íconos (genera PNG 192/512/maskable desde un SVG con «PÁSELE» en Bebas sobre morado), precache de /data y runtime cache de tiles; página offline.
4. `tests/e2e/demo.spec.ts` (Playwright, 390×844) que ejecute el guion con las aserciones de `06_demo.md`. Debe pasar en local.
5. Lighthouse móvil (si está disponible en el entorno); corrige hasta PWA ok, Performance ≥ 80 y Accessibility ≥ 95.
6. Prepara el deploy a Vercel: `vercel.json` solo si hace falta y README con los pasos (`vercel link`, variables de entorno, `vercel --prod`). No despliegues sin que el usuario lo pida.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
