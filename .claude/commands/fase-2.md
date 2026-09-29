---
description: Fase 2 · Interior de La Merced y puesto (M3, M4)
---

# Fase 2 · Interior de La Merced y puesto (M3, M4)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/02_arquitectura.md §Interior, docs/03_datos.md §Interior, docs/05_modulos.md M3 y M4. Usa `src/lib/routing.ts` tal cual (ya tiene tests); si necesitas cambiarlo, los tests existentes deben seguir pasando.

1. `components/interior/InteriorMap.tsx`: SVG por capas + `react-zoom-pan-pinch`. Los puestos reales llevan estrella dorada. Accesos con iconografía (Metro L1).
2. Búsqueda y chips por giro, mini tarjeta de puesto, flujo «Llévame» con selector de origen, polilínea animada (stroke-dashoffset), `RouteSteps` con Anterior/Siguiente y el marcador «Estás aquí», estado «¡Llegaste!».
3. Deep link `?puesto=&desde=`.
4. **M4** Puesto completo (el carrito real llega en la fase 3; por ahora «Agregar» ya escribe en el store).

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
