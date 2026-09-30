# Bara Bara · Mercados Públicos CDMX

PWA que organiza, concentra y visibiliza los mercados públicos de la Ciudad de México, la Central de Abasto, La Nueva Viga y los huertos del suelo de conservación. **Vende, cobra y distribuye**, con comercio justo entre el campo y el consumidor final.

Impulsan SECTUR CDMX, SEDEMA y la Secretaría de Economía. Desarrolla Cinética Studio.

- **Producción (planeada):** https://mercados.cineticastudio.xyz
- **Modo presentación:** `/es/presentacion` (guion de 10 pasos de `docs/06_demo.md`)

> Esta etapa es un frontend completo con **datos mock** (`/data`). Pagos, envíos, escaneo de QR y métricas son simulados; nunca se piden datos reales de tarjeta (tarjeta de prueba `4242 4242 4242 4242`). La arquitectura está lista para conectar Supabase (`supabase/migrations/`) sin reescribir pantallas.

## Desarrollo

Requisitos: Node 20.9+ y pnpm 10.

```bash
pnpm install          # copia también el worker de MapLibre a public/maplibre
cp .env.example .env.local
pnpm dev              # http://localhost:3000/es
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (el service worker está apagado en dev) |
| `pnpm build` | `next build` + `serwist build` (genera `public/sw.js`) |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest: lógica pura de `src/lib` y del store |
| `pnpm e2e` | Playwright: el guion de demo completo a 390×844 (levanta build + start si no hay servidor en :3100) |
| `pnpm validate:data` | Valida `/data` contra `src/lib/schemas.ts` |
| `pnpm icons` | Regenera los íconos de la PWA desde `scripts/generar-iconos.mjs` |

## Perfiles y pantallas

| Perfil | Rutas |
|---|---|
| Consumidor / turista | `/explorar`, `/mercado/[id]` (+ `/interior`), `/puesto/[id]`, `/huertos`, `/agenda`, `/asistente`, `/yo`, `/carrito`, `/checkout`, `/pedido/[id]` |
| Locatario | `/locatario` (Hoy), `/cobrar`, `/pedidos`, `/catalogo`, `/plan` |
| Productor | `/productor` (Cosecha), `/pedidos`, `/huerto` |
| Gobierno | `/gobierno` (layout ancho desde 1024 px) |

Todo lo transaccional persiste en `localStorage` (Zustand, clave `pasele-demo`) y se refleja entre perfiles sin recargar. «Reiniciar demo» (modo presentación o Ajustes) deja todo como en los JSON.

## PWA

- `src/app/manifest.ts`: «Bara Bara · Mercados CDMX», `theme_color #93408F`, `background_color #FEFAEB`, íconos 192/512 + maskable.
- `src/sw.ts` + `serwist.config.mjs`: Serwist en **modo configurator** (`@serwist/next/config` + `@serwist/cli`). El service worker se compila después de `next build`, así que funciona con Turbopack (el plugin de webpack de Serwist no aplica en Next 16).
  - Precache del shell y de los chunks estáticos (los JSON de `/data` viajan dentro de los chunks). No se precachean las ~1,600 páginas prerenderizadas: se cachean al visitarlas.
  - Teselas de CARTO: `StaleWhileRevalidate`, máx. 500 entradas.
  - Sin conexión, cualquier página no visitada cae en `/[locale]/offline` («Sin conexión: tu pasaporte y tus pedidos siguen aquí»).

## Deploy en Vercel

No hace falta `vercel.json`: Vercel detecta Next.js y usa `pnpm build` (que ya incluye `serwist build`).

```bash
pnpm dlx vercel login
pnpm dlx vercel link                 # proyecto nuevo, framework Next.js, raíz del repo
# Variables (Preview y Production). Las NEXT_PUBLIC_* se leen al compilar.
pnpm dlx vercel env add NEXT_PUBLIC_DATA_SOURCE      # mock
pnpm dlx vercel env add NEXT_PUBLIC_MAP_PROVIDER     # maplibre
pnpm dlx vercel env add NEXT_PUBLIC_USD_RATE         # 18.5
pnpm dlx vercel env add ANTHROPIC_API_KEY            # opcional (asistente con IA)
pnpm dlx vercel env add ANTHROPIC_MODEL              # obligatorio si hay key; p. ej. claude-opus-5-5
pnpm dlx vercel                      # deploy de preview
pnpm dlx vercel --prod               # deploy de producción
```

Sin `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`, Marchanta responde con las intenciones guionadas (`src/lib/assistant/intents.ts`). `NEXT_PUBLIC_GOOGLE_MAPS_KEY` y las de Supabase se quedan vacías en esta etapa.

### Dominio `mercados.cineticastudio.xyz` (Cloudflare → Vercel)

1. **Vercel:** proyecto → *Settings* → *Domains* → *Add* → `mercados.cineticastudio.xyz`. Vercel muestra el registro que espera: un **CNAME** con un destino como `cname.vercel-dns.com` o uno propio del proyecto (`…vercel-dns-0xx.com`). Copia exactamente el que te muestre.
2. **Cloudflare:** zona `cineticastudio.xyz` → *DNS* → *Records* → *Add record*:
   - Type: `CNAME`
   - Name: `mercados`
   - Target: el valor que dio Vercel
   - Proxy status: **DNS only** (nube gris). Con el proxy naranja, Vercel no puede emitir el certificado ni verificar el dominio.
   - TTL: Auto
3. Si la zona tiene registros **CAA**, agrega `0 issue "letsencrypt.org"` para que Vercel pueda emitir el certificado.
4. Vuelve a *Domains* en Vercel: en unos minutos marca *Valid Configuration* y emite el SSL. Para que las URLs de preview no se confundan con producción, deja `mercados.cineticastudio.xyz` asignado a la rama de producción.

## Calidad (build local, Lighthouse 13 móvil)

| Pantalla | Performance | Accesibilidad | Buenas prácticas |
|---|---|---|---|
| `/es` (entrada), `/yo`, `/puesto/…`, `/productor`, `/presentacion`, `/asistente` | 90–95 | 96–100 | 96 |
| `/locatario` | 85 | 100 | 96 |
| `/explorar`, `/huertos`, `/gobierno` (con mapa) | 71–75 | 100 | 96 |

Las pantallas con mapa pierden puntos por evaluar MapLibre (~1 MB de JS, se monta en tiempo libre). El LCP real observado es de ~0.15 s; lo que baja la nota es el *Total Blocking Time* simulado a 4× CPU. Lighthouse 13 ya no tiene categoría PWA: la instalabilidad se verificó con Chrome (`Page.getInstallabilityErrors` sin errores).

## Estructura

| Ruta | Contenido |
|---|---|
| `docs/` | Producto, arquitectura, datos, diseño, módulos, guion de demo |
| `data/` | JSON de la Guía de Mercados CDMX 2026 y datos simulados |
| `src/data/repository.ts` | Único acceso a datos (`MockRepository` hoy, `SupabaseRepository` después) |
| `src/lib/` | Lógica pura con tests: horarios, rutas, precios, puntos, distancias, búsqueda, asistente, gobierno, presentación |
| `src/components/` | Un componente por archivo, por módulo |
| `messages/` | Textos de UI en `es` y `en` |
| `supabase/migrations/` | Esquema futuro (Postgres + PostGIS). No se conecta en esta etapa |
| `tests/unit`, `tests/e2e` | Vitest y Playwright |

Fuente de los datos de mercados: Guía de Mercados CDMX 2026. Las fotos de la guía son propiedad de SECTUR y no se usan; la app usa placeholders con degradado y papel picado.
