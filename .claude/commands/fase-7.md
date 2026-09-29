---
description: Fase 7 · Vistas de Locatario y Productor (M13–M18)
---

# Fase 7 · Vistas de Locatario y Productor (M13–M18)

Lee `CLAUDE.md` y `PLAN.md`. Luego lee las secciones de `docs/` indicadas abajo antes de escribir código.
Trabaja módulo por módulo, con commits pequeños (`feat(Mx): …`). No hagas push.

Lee: docs/05_modulos.md M13 a M18 y data/usuarios_demo.json.

1. Locatario: Hoy (KPIs + Recharts + reseñas + banner de check-ins), Cobrar (teclado → QR → pago recibido + vibración), Pedidos (incluye los creados por el consumidor en M5 para `pancita-dona-chela`, con cambio de estado), Catálogo (edición y límite de 20 en Gratis) y Plan.
2. Productor: Cosecha (publicar lote + vista previa), Pedidos de mayoreo con estados y Mi huerto con `<FairTradeCard>`.
3. Todo cambio persiste en el store y se refleja entre perfiles sin recargar.

## Al terminar
1. `pnpm validate:data && pnpm lint && pnpm test && pnpm build`: todo en verde. Si algo falla, arréglalo antes de reportar.
2. Marca las casillas de esta fase en `PLAN.md`.
3. Levanta `pnpm dev` y revisa las pantallas nuevas a 390×844 (Playwright screenshot si está disponible). Corrige lo que se vea roto.
4. Reporta en 5–8 líneas: qué quedó, decisiones que tomaste, qué quedó pendiente y cualquier dato que falte.
