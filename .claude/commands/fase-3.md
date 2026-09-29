---
description: Fase 3 · Carrito, pago, pedido y comercio justo (M5, M7)
---

# Fase 3 · Carrito, pago, pedido y comercio justo (M5, M7)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/05_modulos.md M5 y M7, docs/01_producto.md §Modelo de negocio y data/modelo_negocio.json.

1. `lib/money.ts` (formatMXN, toUSD), `lib/loyalty.ts` (puntos por compra, dobles con huerto, niveles) y `lib/fairtrade.ts`, con tests.
2. **M5**: carrito multi-puesto, checkout (entrega recoger o terceros, resumen con tarifa, descuentos por plan), pago QR (qrcode.react + contador) y tarjeta (Luhn, 4242…), `/pedido/[folio]` con timeline automático y puntos con animación de sello.
3. **M7** `<FairTradeCard>`: úsala en el puesto (si hay huerto_id), en la confirmación y lista para el productor.
4. Garantiza que nunca se haga fetch con datos de tarjeta.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
