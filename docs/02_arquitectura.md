# 02 · Arquitectura

## Estructura de carpetas

```
/
├─ CLAUDE.md · PLAN.md · README.md
├─ data/                      # JSON fuente (mock). No editar a mano salvo correcciones.
├─ docs/
├─ messages/es.json · en.json # next-intl
├─ public/ (icons, manifest, patrones SVG de papel picado)
├─ supabase/migrations/       # esquema futuro (no se conecta en esta etapa)
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx                 # providers, PhoneFrame, ProfileSwitcher
│  │  │  ├─ page.tsx                   # M0 splash + onboarding + selector de perfil
│  │  │  ├─ (consumidor)/
│  │  │  │  ├─ layout.tsx              # TabBar consumidor + CartFab
│  │  │  │  ├─ explorar/page.tsx       # M1 mapa + M20 rescate
│  │  │  │  ├─ mercado/[id]/page.tsx   # M2 ficha
│  │  │  │  ├─ mercado/[id]/interior/page.tsx  # M3 (solo interior_disponible)
│  │  │  │  ├─ puesto/[id]/page.tsx    # M4
│  │  │  │  ├─ carrito/page.tsx · checkout/page.tsx · pedido/[id]/page.tsx  # M5
│  │  │  │  ├─ huertos/page.tsx · huertos/[id]/page.tsx   # M6 (id = productor)
│  │  │  │  ├─ asistente/page.tsx      # M22
│  │  │  │  ├─ agenda/page.tsx · rutas/[id]/page.tsx      # M10, M11
│  │  │  │  └─ yo/page.tsx · yo/planes/page.tsx · yo/escanear/page.tsx  # M9, M12
│  │  │  ├─ locatario/ (layout con TabBar) hoy · cobrar · pedidos · catalogo · plan   # M13–M16
│  │  │  ├─ productor/ (layout con TabBar) cosecha · pedidos · huerto                # M17–M18
│  │  │  ├─ gobierno/page.tsx          # M19 (layout ancho)
│  │  │  └─ presentacion/page.tsx      # modo demo guiado
│  │  ├─ api/asistente/route.ts        # M22 (Anthropic si hay key; fallback guionado)
│  │  └─ manifest.ts · sw.ts           # PWA (Serwist)
│  ├─ components/
│  │  ├─ ui/ (shadcn)
│  │  ├─ map/ MapView.tsx · MarketLayer.tsx · ZoneLayer.tsx · providers/{maplibre,google}.tsx
│  │  ├─ interior/ InteriorMap.tsx · RouteSteps.tsx · StallMarker.tsx
│  │  ├─ market/ · stall/ · cart/ · fairtrade/ · passport/ · agenda/ · assistant/ · dashboard/
│  │  └─ shell/ PhoneFrame.tsx · TabBar.tsx · ProfileSwitcher.tsx · LocaleToggle.tsx
│  ├─ data/
│  │  ├─ repository.ts          # interface Repository
│  │  ├─ mock-repository.ts     # lee /data (import estático), valida con zod una vez
│  │  └─ supabase-repository.ts # stub con TODOs (lanza "not implemented")
│  ├─ lib/
│  │  ├─ schemas.ts   # zod (ya viene en el pack)
│  │  ├─ horario.ts   # abiertoAhora(), proximaApertura()
│  │  ├─ routing.ts   # dijkstra(grafo, desde, hacia) → {nodos, pasos, metros, minutos}
│  │  ├─ geo.ts       # haversine, bbox, formatDistance
│  │  ├─ search.ts    # búsqueda normalizada (sin acentos) sobre mercados/puestos/productos
│  │  ├─ money.ts     # formatMXN, toUSD
│  │  ├─ loyalty.ts   # puntosPorCompra, puntosCheckin, nivelActual, progreso
│  │  ├─ fairtrade.ts # participación del productor, mejora %
│  │  └─ assistant/   # intents.ts (fallback) · context.ts (recorte de datos para el LLM)
│  └─ store/ useAppStore.ts (perfil, idioma, carrito, puntos, sellos, pedidos, recordatorios)
└─ tests/ unit/*.test.ts · e2e/demo.spec.ts
```

## Capa de datos

```ts
export interface Repository {
  mercados(filtro?: FiltroMercados): Promise<Mercado[]>;
  mercado(id: string): Promise<Mercado | null>;
  interior(mercadoId: string): Promise<Interior | null>;   // hoy solo 'la-merced'
  puesto(id: string): Promise<Puesto | null>;
  zonasHuerto(): Promise<ZonaHuerto[]>;
  productores(filtro?: FiltroProductores): Promise<Productor[]>;
  productor(id: string): Promise<Productor | null>;
  eventos(desde?: Date): Promise<Evento[]>;
  rutas(): Promise<Ruta[]>;
  resenas(objetivoId: string): Promise<Resena[]>;
  lealtad(): Promise<Lealtad>;
  demo(): Promise<UsuariosDemo>;
  metricas(): Promise<MetricasGobierno>;
  modeloNegocio(): Promise<ModeloNegocio>;
}
```

- `getRepository()` devuelve `MockRepository` si `NEXT_PUBLIC_DATA_SOURCE !== 'supabase'`.
- Todo lo que el usuario crea (pedidos, reseñas nuevas, lotes publicados, productos agregados, recordatorios, puntos) vive en Zustand persistido. Las pantallas combinan los datos del repositorio con el estado local.

## Mapas

- **`<MapView>`**, con props `center`, `zoom`, `layers` y `onSelect`.
  - Implementación por default: MapLibre con el estilo `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`.
  - Si `NEXT_PUBLIC_MAP_PROVIDER=google` y hay `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, usa `@vis.gl/react-google-maps`. Esta variante se deja como stub funcional mínimo.
- **Clustering:** con la fuente GeoJSON (`cluster: true`, `clusterRadius: 50`). Los destacados van en una capa aparte, siempre visible y sin cluster.
- **«Cómo llegar»:** `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=transit`.
- **Zonas de huerto:** `poligono_ilustrativo` viene como `[lat, lng][]`. **Hay que invertirlo a `[lng, lat]`** para GeoJSON y cerrar el anillo.

## Interior (La Merced)

- **SVG** con `viewBox="0 0 1200 800"`. Pan y zoom con `react-zoom-pan-pinch`.
- **Capas, en orden:** calles → edificios → pasillos (aristas del grafo, gris claro) → puestos → accesos → ruta activa → marcador «estás aquí».
- **Ruteo:**
  - Si existe `rutas_precalculadas[id = "${desde}__${puesto}"]`, se usa esa ruta.
  - Si no, `dijkstra()` sobre `grafo`, con pesos euclidianos.
  - Las instrucciones se generan con el mismo algoritmo que produjo las precalculadas (ver `03_datos.md`). **Test obligatorio:** las 9 rutas recalculadas deben dar los mismos nodos que las precalculadas.
- **Minutos:** `max(1, round(metros / 70))`.

## Asistente AI (M22)

- `POST /api/asistente` recibe `{ messages, locale, perfil, ubicacion? }` y devuelve `{ text, cards: Card[] }`, donde `Card = { tipo: 'mercado'|'puesto'|'productor'|'evento'|'ruta', id }`.
- **Si existe `ANTHROPIC_API_KEY`:** llama a la Messages API con el modelo de `ANTHROPIC_MODEL` (**obligatoria**, sin default hardcodeado).
  - El system prompt está en `05_modulos.md` §M22.
  - El contexto lo arma `lib/assistant/context.ts`: los 15–25 registros más relevantes según la búsqueda local, más los eventos de los próximos 30 días. Hay que pedir la respuesta en JSON y validarla con zod.
- **Sin key:** `lib/assistant/intents.ts` resuelve por palabras clave (ES/EN) al menos las 8 intenciones de `05_modulos.md`, calculando de verdad «abierto ahora», distancias y fechas.
- **Límite freemium:** 20 mensajes al día en el plan Gratis, contados en el store; ilimitado con Pase Turista o Mercado+.

## PWA

- Serwist: precache del shell y de `/data/*.json`; runtime cache `StaleWhileRevalidate` para los tiles de CARTO (máx. 500 entradas).
- `manifest.ts`: name «Bara Bara · Mercados CDMX», `theme_color #93408F`, `background_color #FEFAEB`, `display standalone` e íconos de 192 y 512 px, además del maskable.
- Página offline con el mensaje «Sin conexión: tu pasaporte y tus pedidos siguen aquí».

## Variables de entorno (`.env.example`)

```
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_MAP_PROVIDER=maplibre
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_USD_RATE=18.5
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Deploy

- **Vercel:** proyecto nuevo, framework Next.js; las variables de arriba van en Preview y Production.
- `pnpm build` debe pasar sin errores ni warnings de TS.
- **Lighthouse (móvil):** PWA instalable, Performance ≥ 80 y Accessibility ≥ 95.

## Roadmap de backend (fuera de esta etapa, solo documentado)

1. Supabase: aplicar `supabase/migrations/0001_init.sql`, sembrar desde `/data` (script `scripts/seed.ts`) e implementar `SupabaseRepository`.
2. Auth con teléfono (OTP) para locatarios y productores; RLS por rol.
3. Pagos: agregador CoDi/SPEI y procesador de tarjeta (Conekta, Stripe MX o Mercado Pago), con webhooks → `pagos`.
4. Envíos con terceros por API (Rappi, Uber Direct, 99).
5. Panel de gobierno sobre vistas materializadas.
