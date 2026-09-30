# PLAN · fases de construcción

Cada fase se lanza con su comando (`/fase-0` … `/fase-8`). Al terminar una fase: `pnpm build && pnpm test`, marca las casillas y haz commit.

## Fase 0 · Base del proyecto `/fase-0`
- [x] Scaffold Next.js (App Router, TS strict, Tailwind v4, ESLint, `src/`), pnpm
- [x] Dependencias del stack (ver CLAUDE.md) y shadcn/ui inicializado
- [x] Mover al repo `data/`, `docs/`, `src/lib/{schemas,routing,horario}.ts`, `scripts/validate-data.ts`, `tests/unit/*`, `supabase/`
- [x] Scripts de package.json: `validate:data`, `test`, `e2e`
- [x] Tokens y fuentes (`04_diseno.md`), patrón de papel picado y placeholder fotográfico
- [x] next-intl (es/en) con `messages/*.json`
- [x] Zustand store con persist + «Reiniciar demo»
- [x] `Repository` + `MockRepository` + stub `SupabaseRepository`
- [x] Shell: PhoneFrame, TabBar por perfil, ProfileSwitcher, LocaleToggle
- [x] **M0** Entrada
- [x] `pnpm validate:data` y `pnpm test` en verde

## Fase 1 · Descubrir `/fase-1`
- [x] `<MapView>` MapLibre + CARTO (con abstracción de proveedor)
- [x] **M1** Mapa ciudad: clusters, destacados, búsqueda, filtros, bottom sheet
- [x] **M2** Ficha de mercado (346 fichas renderizan)
- [x] `lib/search.ts` y `lib/geo.ts` con tests

## Fase 2 · Llegar al puesto `/fase-2`
- [x] **M3** Interior La Merced: SVG, pan y zoom, búsqueda, «Llévame», pasos, deep link
- [x] **M4** Puesto

## Fase 3 · Comprar justo `/fase-3`
- [x] **M5** Carrito, entrega, pago QR y tarjeta, pedido con timeline
- [x] **M7** `<FairTradeCard>`
- [x] `lib/money.ts`, `lib/loyalty.ts` y `lib/fairtrade.ts` con tests

## Fase 4 · Huertos `/fase-4`
- [x] **M6** Mapa de zonas y productores, compra al mayoreo, reserva de visita

## Fase 5 · Volver al mercado `/fase-5`
- [x] **M8** Reseñas · **M9** Pasaporte y check-in · **M10** Agenda · **M11** Rutas · **M12** Planes · **M20** Rescata hoy

## Fase 6 · Marchanta `/fase-6`
- [x] **M22** Chat, tarjetas accionables, `/api/asistente` (Anthropic + fallback), límite freemium
- [x] Tests de `intents.ts` (8 intenciones × ES/EN)

## Fase 7 · Vender y cosechar `/fase-7`
- [x] **M13–M16** Locatario
- [x] **M17–M18** Productor

## Fase 8 · Pitch y salida `/fase-8`
- [ ] **M19** Panel de gobierno
- [ ] Modo presentación (`06_demo.md`)
- [ ] PWA (Serwist, manifest, íconos, offline)
- [ ] e2e Playwright del guion completo
- [ ] Lighthouse móvil: PWA ok, Performance ≥ 80, Accessibility ≥ 95
- [ ] Deploy a Vercel (preview) y README con la URL
- [ ] Dominio `mercados.cineticastudio.xyz`: dominio en el proyecto de Vercel + registro CNAME en Cloudflare (DNS only)

Después de cualquier fase se puede correr **`/revisar-demo`**, que ejecuta el guion y reporta lo que falle.
