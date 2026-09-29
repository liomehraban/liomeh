---
description: Fase 1 · Mapa de la ciudad y ficha de mercado (M1, M2)
---

# Fase 1 · Mapa de la ciudad y ficha de mercado (M1, M2)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/02_arquitectura.md §Mapas, docs/04_diseno.md, docs/05_modulos.md M1 y M2, y docs/03_datos.md §Mercados.

1. `<MapView>` con proveedor MapLibre (react-map-gl/maplibre, estilo CARTO Voyager). Deja el proveedor Google como stub mínimo detrás de `NEXT_PUBLIC_MAP_PROVIDER`.
2. `lib/search.ts` (normaliza acentos, tokeniza, puntúa nombre > giros > imperdibles > productos de puestos) y `lib/geo.ts` (haversine, formatDistance), con tests.
3. **M1** completo, con todos sus AC (clusters, capa de destacados, chips, bottom sheet de filtros, bottom sheet de mercado, «Cómo llegar», carrusel «Cerca de ti»). El carrusel «Rescata hoy» queda como placeholder para la fase 5.
4. **M2** completo. Agrega un test que recorra los 346 ids y verifique que la ficha renderiza (Testing Library o render de servidor).

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
