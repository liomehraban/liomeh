# PLAN · fases de construcción

Cada fase se lanza con su comando (`/fase-0` … `/fase-8`). Al terminar una fase: `pnpm build && pnpm test`, marca las casillas y haz commit.

## Fase 0 · Base del proyecto `/fase-0`
- [ ] Scaffold Next.js (App Router, TS strict, Tailwind v4, ESLint, `src/`), pnpm
- [ ] Dependencias del stack (ver CLAUDE.md) y shadcn/ui inicializado
- [ ] Mover al repo `data/`, `docs/`, `src/lib/{schemas,routing,horario}.ts`, `scripts/validate-data.ts`, `tests/unit/*`, `supabase/`
- [ ] Scripts de package.json: `validate:data`, `test`, `e2e`
- [ ] Tokens y fuentes (`04_diseno.md`), patrón de papel picado y placeholder fotográfico
- [ ] next-intl (es/en) con `messages/*.json`
- [ ] Zustand store con persist + «Reiniciar demo»
- [ ] `Repository` + `MockRepository` + stub `SupabaseRepository`
- [ ] Shell: PhoneFrame, TabBar por perfil, ProfileSwitcher, LocaleToggle
- [ ] **M0** Entrada
- [ ] `pnpm validate:data` y `pnpm test` en verde

## Fase 1 · Descubrir `/fase-1`
- [ ] `<MapView>` MapLibre + CARTO (con abstracción de proveedor)
- [ ] **M1** Mapa ciudad: clusters, destacados, búsqueda, filtros, bottom sheet
- [ ] **M2** Ficha de mercado (346 fichas renderizan)
- [ ] `lib/search.ts` y `lib/geo.ts` con tests

## Fase 2 · Llegar al puesto `/fase-2`
- [ ] **M3** Interior La Merced: SVG, pan y zoom, búsqueda, «Llévame», pasos, deep link
- [ ] **M4** Puesto

## Fase 3 · Comprar justo `/fase-3`
- [ ] **M5** Carrito, entrega, pago QR y tarjeta, pedido con timeline
- [ ] **M7** `<FairTradeCard>`
- [ ] `lib/money.ts`, `lib/loyalty.ts` y `lib/fairtrade.ts` con tests

## Fase 4 · Huertos `/fase-4`
- [ ] **M6** Mapa de zonas y productores, compra al mayoreo, reserva de visita

## Fase 5 · Volver al mercado `/fase-5`
- [ ] **M8** Reseñas · **M9** Pasaporte y check-in · **M10** Agenda · **M11** Rutas · **M12** Planes · **M20** Rescata hoy

## Fase 6 · Marchanta `/fase-6`
- [ ] **M22** Chat, tarjetas accionables, `/api/asistente` (Anthropic + fallback), límite freemium
- [ ] Tests de `intents.ts` (8 intenciones × ES/EN)

## Fase 7 · Vender y cosechar `/fase-7`
- [ ] **M13–M16** Locatario
- [ ] **M17–M18** Productor

## Fase 8 · Pitch y salida `/fase-8`
- [ ] **M19** Panel de gobierno
- [ ] Modo presentación (`06_demo.md`)
- [ ] PWA (Serwist, manifest, íconos, offline)
- [ ] e2e Playwright del guion completo
- [ ] Lighthouse móvil: PWA ok, Performance ≥ 80, Accessibility ≥ 95
- [ ] Deploy a Vercel (preview) y README con la URL

Después de cualquier fase se puede correr **`/revisar-demo`**, que ejecuta el guion y reporta lo que falle.
