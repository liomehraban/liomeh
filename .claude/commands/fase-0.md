---
description: Fase 0 · Base del proyecto (scaffold, diseño, i18n, store, datos, shell, M0)
---

# Fase 0 · Base del proyecto (scaffold, diseño, i18n, store, datos, shell, M0)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/01_producto.md, docs/02_arquitectura.md, docs/03_datos.md, docs/04_diseno.md, y en docs/05_modulos.md la sección M0.

Este repo ya trae `data/`, `docs/`, `src/lib/{schemas,routing,horario}.ts`, `scripts/validate-data.ts`, `tests/unit/`, `supabase/` y `.env.example`. **No los sobrescribas.**

1. Crea la app Next.js en este mismo directorio (App Router, TypeScript strict, Tailwind v4, ESLint, carpeta `src/`, pnpm, alias `@/*`). Si el scaffolder no acepta un directorio con archivos, genera en una carpeta temporal y mueve los archivos del proyecto sin pisar los existentes.
2. Instala las dependencias del stack de CLAUDE.md. Agrega `tsx`, `vitest` y `@playwright/test` como dev deps. Inicializa shadcn/ui (button, sheet, dialog, tabs, input, badge, toast/sonner, card, switch, slider).
3. Scripts: `"validate:data": "tsx scripts/validate-data.ts"`, `"test": "vitest run"`, `"e2e": "playwright test"`. Configura Vitest para `tests/unit` y habilita `resolveJsonModule`.
4. Aplica los tokens de `04_diseno.md` en `globals.css` con `@theme`. Fuentes Bebas Neue y Public Sans con `next/font/google`. Crea `public/papel-picado.svg` y el componente `<PhotoPlaceholder giro>`.
5. next-intl con locales `es` (default) y `en`, middleware y `messages/es.json` y `en.json` con la estructura por módulo.
6. `src/store/useAppStore.ts` (Zustand + persist) con el estado de `03_datos.md` y `resetDemo()`.
7. `src/data/repository.ts`, `mock-repository.ts` (import estático de /data + `Schema.parse` una sola vez) y el stub `supabase-repository.ts`.
8. Shell: `PhoneFrame` (en desktop ≥768 px), `TabBar` por perfil, `ProfileSwitcher` y `LocaleToggle`. Crea los layouts de grupos de rutas según `02_arquitectura.md`, con páginas placeholder.
9. Implementa **M0** completo.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
