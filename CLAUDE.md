# CLAUDE.md · Pásele (app de Mercados Públicos CDMX)

> Memoria del proyecto para Claude Code. Léela completa antes de cada fase.

## Qué construimos

«Pásele» (nombre provisional) es la PWA que organiza, concentra y visibiliza los 340 mercados públicos de la Ciudad de México, además de la Central de Abasto, La Nueva Viga y los huertos del suelo de conservación. Hace tres cosas: **vende, cobra y distribuye**. El ADN es el **comercio justo entre el campo y el consumidor final**.

La impulsan SECTUR CDMX, SEDEMA y la Secretaría de Economía. La desarrolla Cinética Studio.

**Alcance de esta etapa:** una PWA frontend *completamente funcional* con **datos mock** (los JSON de `/data`). Pagos, envíos, escaneo de QR y métricas son simulados. La arquitectura queda lista para conectar Supabase después, sin reescribir las pantallas.

Las especificaciones están en `/docs`, en este orden: `01_producto.md` → `02_arquitectura.md` → `03_datos.md` → `04_diseno.md` → `05_modulos.md` → `06_demo.md`. El plan de trabajo está en `PLAN.md`.

## Stack (no cambiar sin preguntar)

- **Next.js** (última versión estable, App Router, React Server Components donde tenga sentido) + **TypeScript strict**
- **Tailwind CSS v4** + **shadcn/ui** + **lucide-react** + **motion** (animaciones)
- **Zustand**, con `persist` en localStorage, para perfil activo, idioma, carrito, puntos, sellos, recordatorios y pedidos
- **next-intl**: locales `es` (default) y `en`, con rutas `/[locale]/…`
- **MapLibre GL** vía `react-map-gl/maplibre`, con estilo CARTO Voyager sin API key. Hay que abstraerlo detrás de `<MapView>` para poder cambiar a Google Maps con `NEXT_PUBLIC_MAP_PROVIDER`.
- **Interior de La Merced:** componente SVG propio, con Dijkstra en `src/lib/routing.ts`
- **Recharts** (paneles), **qrcode.react** (QR), **date-fns** con locale `es`
- **Serwist** (`@serwist/next`) para PWA y cache offline
- **zod** para validar los datos
- **Vitest** (unit) + **Playwright** (e2e del guion de demo)
- **pnpm** · deploy en **Vercel**
- **Backend futuro:** Supabase (Postgres + PostGIS). El esquema ya está en `supabase/migrations/`. **No conectarlo en esta etapa.**

## Comandos

```bash
pnpm dev            # desarrollo
pnpm build          # debe pasar sin errores ni warnings de TS
pnpm lint
pnpm test           # vitest
pnpm e2e            # playwright (guion de demo)
pnpm validate:data  # valida /data contra src/lib/schemas.ts
```

## Reglas de oro

1. **Los datos reales mandan.** Nunca inventes mercados, direcciones, horarios, eventos ni cifras de la guía: léelos de `/data`. Si falta un dato, muestra un estado vacío elegante; no lo inventes.
2. **Todo el acceso a datos pasa por `src/data/repository.ts`.** Las pantallas nunca importan JSON directo. Hoy se usa `MockRepository`; mañana `SupabaseRepository`.
3. **Mobile-first:** diseña a 390 px de ancho. En desktop, las vistas de consumidor, locatario y productor se muestran dentro de un marco de teléfono centrado; el panel de gobierno usa layout ancho a partir de 1024 px.
4. **Bilingüe desde el día 1.** Ningún string de UI va hardcodeado: todo sale de `messages/es.json` y `messages/en.json`. Los nombres de mercados, puestos y platillos quedan en español; en inglés se muestran `lema_en` y `resumen_en` cuando existan.
5. **Todo lo transaccional se simula con realismo:** estados, tiempos, confirmaciones y persistencia local. Nunca se piden datos reales de tarjeta. La tarjeta de prueba es `4242 4242 4242 4242`.
6. **Accesibilidad:** contraste AA, áreas táctiles de 44 px, `aria-label` en íconos y respeto a `prefers-reduced-motion`.
7. **Identidad CDMX:** usa solo los tokens de `docs/04_diseno.md`. No se usan fotos de la guía (son propiedad de SECTUR); van placeholders con degradado y patrón de papel picado.
8. **La lógica pura va en `src/lib`, con tests:** horarios, rutas, precios, puntos, distancias y búsqueda.
9. **Commits pequeños por módulo** (`feat(M3): ruta paso a paso en interior`). No hagas push ni PR salvo que se pida.
10. **Al terminar cada fase:** `pnpm build && pnpm test`, marca las casillas de `PLAN.md` y resume qué quedó y qué falta.

## Convenciones

- Rutas en español: `/explorar`, `/mercado/[id]`, `/puesto/[id]`, `/huertos`, `/agenda`, `/yo`, `/locatario`, `/productor`, `/gobierno`.
- Componentes en `PascalCase`, hooks `useX`, utilidades en `camelCase`. Un componente por archivo.
- Montos: enteros en MXN; formatea con `formatMXN()`. En `en`, muestra además un aproximado en USD (`NEXT_PUBLIC_USD_RATE`, default 18.5).
- Hora: zona `America/Mexico_City` en todos los cálculos de «abierto ahora».
- Todo lo que venga de la guía lleva la leyenda «Fuente: Guía de Mercados CDMX 2026».

## Next.js

@AGENTS.md
