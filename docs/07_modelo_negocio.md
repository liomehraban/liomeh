# Modelo de negocio · Pásele (propuesta Cinética)

## El principio

**La app no depende de la comisión.** Si la venta se hace en efectivo en el mostrador, el valor igual se captura:

- **El cliente** hace check-in con el QR del puesto y gana puntos.
- **El locatario** gana reseñas, visibilidad y un historial de ventas.
- **El gobierno** recibe el dato de la venta.
- **La plataforma** cobra por suscripciones, turismo, patrocinios y licencia, no por cada peso que pasa.

## Freemium por perfil

| Perfil | Gratis | De pago |
|---|---|---|
| **Consumidor / turista** | Mapa de 340+ mercados, interior y rutas paso a paso, huertos, agenda, reseñas, Pasaporte, asistente AI (20 preguntas al día), pago con QR y tarjeta | **Pase Turista 7 días: $149 MXN.** Rutas premium con audioguía, traductor con el locatario, mapas sin conexión, asistente ilimitado y 10% en puestos adheridos. **Mercado+: $49/mes.** Sin tarifa de servicio, puntos dobles y alertas de temporada |
| **Locatario** | Ficha, catálogo de 20 productos, cobro QR sin comisión, pedidos para recoger, reseñas y lealtad (subsidiado por gobierno) | **Pro: $149/mes.** Catálogo ilimitado, envíos, promociones, analítica y presencia en rutas. **Plus: $349/mes.** Destacado, multiusuario, reporte de ventas para crédito y catálogo traducido |
| **Productor** | Perfil, lotes, venta de mayoreo y visitas al huerto | Comisión del 3% en mayoreo pagado en la app |

## Comisiones

| Concepto | Pásele | Referencia de mercado |
|---|---|---|
| Cobro presencial con QR CoDi/SPEI | **0%** | — |
| Cobro presencial con tarjeta | Costo del procesador, sin margen | Terminales en MX: ≈3–4% + IVA |
| Pedido en línea | **4%** al comercio y $9 de tarifa de servicio al consumidor | Apps de delivery: **18–30% + IVA** |
| Mayoreo productor | 3% | Intermediario: el productor recibe 23–38% del precio final |
| Tours y experiencias | 20% del ticket | — |

## Patrocinios

| Formato | Precio |
|---|---|
| Naming de ruta («Ruta del Mole presentada por…») | $120,000 al mes |
| Evento del calendario | $80,000 por evento |
| Activación o muestreo en mercado | $60,000 al mes |

## Licencia de gobierno

- **Implementación:** $15 M MXN, pago único.
- **Operación:** $24 M MXN al año, unos **$5,900 por mercado al mes**.
- **Cubre:** gratuidad para locatarios y productores, el panel de impacto de las tres secretarías, capacitación en mercados y mantenimiento de los datos de los 340 mercados.

## Proyección a 3 años (escenario base, en MXN)

| | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| GMV que pasa por la app | $1,011 M | $2,628 M | $4,548 M |
| Comisiones de pedidos en línea | $12.1 M | $36.8 M | $72.8 M |
| Suscripciones de locatarios | $2.4 M | $8.4 M | $17.0 M |
| Turistas (pases y Mercado+) | $13.6 M | $41.5 M | $77.1 M |
| Experiencias y tours | $1.5 M | $5.1 M | $10.2 M |
| Patrocinios | $3.6 M | $10.8 M | $19.2 M |
| Licencia de gobierno | $39.0 M | $24.0 M | $24.0 M |
| **Total** | **$72.3 M** | **$126.6 M** | **$220.2 M** |
| % de ingreso que NO depende de comisión | 83% | 71% | 67% |
| % que depende del gobierno | 54% | 19% | 11% |

**Lectura para el pitch:** el gobierno arranca el proyecto y la app se vuelve autosostenible. Al año 3, el financiamiento público representa solo el 11% del ingreso.

## Supuestos (editables en `data/modelo_negocio.json`)

- **Pedidos en línea:** 30% / 35% / 40% del GMV.
- **Locatarios activos promedio:** 9k / 20k / 32k.
- **Adopción de planes de pago:** Pro 10–18% y Plus 2–5%.
- **Turistas:** Pase Turista 60k / 180k / 320k al año; Mercado+ 8k / 25k / 50k suscriptores.
- **Tours:** 9k / 30k / 60k al año, con ticket promedio de $850.

Son cifras propuestas para la maqueta. Hay que validarlas con finanzas antes de presentarlas como compromiso.
