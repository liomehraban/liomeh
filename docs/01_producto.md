# 01 · Producto

## Visión

Organizar, concentrar y visibilizar los **340 mercados públicos de la CDMX** (en 16 alcaldías), además de la Central de Abasto, La Nueva Viga y los huertos del suelo de conservación, en una sola app que **vende, cobra y distribuye**, con **comercio justo entre el campo y el consumidor final**.

Tono, tomado de la guía oficial: *«En los mercados no sólo se compra: se conversa, se pregunta, se regresa… sin filtros, sin prisa, sin algoritmos.»* La app tiene que sentirse cálida, de barrio y orgullosa, no como un marketplace corporativo.

**Financiamiento:** SECTUR CDMX, SEDEMA y la Secretaría de Economía. La app está pensada para uso masivo, turistas incluidos.

## Perfiles

| Perfil | Objetivo | Personaje demo |
|---|---|---|
| Turista / consumidor | Descubrir, llegar al puesto, comprar, pagar y vivir la cultura | **Emily** (Toronto, EN) · **Sofía** (Coyoacán, ES) |
| Locatario | Cobrar sin terminal, recibir pedidos, ser visible | **Doña Chela**, de Pancita Doña Chela (La Merced, plan Pro) |
| Productor | Vender al mayoreo directo con precio justo | **Lucía Romero**, de Chinampa Atlapulco Verde (Xochimilco) |
| Gobierno | Medir el impacto por secretaría | Panel SECTUR · SEDEMA · SE |

En toda la app hay un **selector de perfil** flotante: es para el pitch y la demo.

## Módulos (todos entran en esta etapa)

| Grupo | Módulos |
|---|---|
| **Base** | M0 Entrada · M1 Mapa ciudad · M2 Ficha de mercado · M3 Interior La Merced · M4 Puesto · M5 Carrito, pago y entrega · M6 Mapa de huertos · M7 Del huerto a tu mesa |
| **Consumidor** | M8 Reseñas · M9 Pasaporte (lealtad) · M10 Agenda cultural · M11 Rutas · M12 Planes · M20 Rescata hoy · M22 Asistente «Marchanta» 24/7 |
| **Locatario** | M13 Hoy · M14 Cobrar · M15 Catálogo · M16 Plan |
| **Productor** | M17 Cosecha · M18 Pedidos de mayoreo |
| **Gobierno** | M19 Panel de impacto |
| **Pitch** | Modo presentación |

El detalle y los criterios de aceptación de cada uno están en `05_modulos.md`.

## Navegación

- **Consumidor:** Explorar · Huertos · **Asistente** (botón central) · Agenda · Yo. El carrito es flotante (FAB).
- **Locatario:** Hoy · Cobrar · Pedidos · Catálogo · Cuenta.
- **Productor:** Cosecha · Pedidos · Mi huerto · Cuenta.
- **Gobierno:** dashboard de una sola página, con pestañas por secretaría.

## Modelo de negocio (lo que la UI tiene que reflejar)

**Principio:** la app no depende de la comisión. Si el cliente paga en efectivo, hace **check-in con el QR del puesto**: gana puntos, el locatario gana reseñas y visibilidad, y el gobierno recibe el dato de la venta.

**Consumidor**

| Plan | Precio | Qué incluye |
|---|---|---|
| Gratis | $0 | Todo lo esencial; asistente con 20 preguntas al día |
| Pase Turista (7 días) | $149 | Rutas premium, traductor, modo sin conexión, asistente ilimitado y 10% de descuento en puestos adheridos |
| Mercado+ | $49/mes | Sin tarifa de servicio, puntos dobles y alertas |

**Locatario**

| Plan | Precio | Qué incluye |
|---|---|---|
| Gratis | $0 | Subsidiado por gobierno. Catálogo de 20 productos y cobro con QR al 0% |
| Pro | $149/mes | — |
| Plus | $349/mes | — |

**Productor:** gratis, con 3% sobre las ventas de mayoreo.

**Comisiones y otros ingresos**

- Cobro con QR presencial: **0%**.
- Tarjeta: se cobra solo el costo del procesador, sin margen.
- Pedido en línea: **4%** al comercio (las apps de delivery cobran entre 18% y 30% más IVA), más **$9** de tarifa de servicio al consumidor.
- Tours: 20%.
- Patrocinios.
- Licencia de gobierno.

El detalle numérico está en `data/modelo_negocio.json` y en `docs/07_modelo_negocio.md`.

## Fuera de alcance en esta etapa

- Backend real, auth y pagos reales.
- Planos reales de mercados distintos a La Merced (el resto muestra el estado vacío «Mapa interior próximamente»).
- Fotografía oficial.
