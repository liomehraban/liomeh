# 05 · Módulos y criterios de aceptación

Formato de cada módulo: **Ruta** · **Qué hace** · **AC** (criterios de aceptación verificables). Un módulo está terminado cuando cumple todos sus AC en `es` y en `en`, se ve bien a 390 px y pasa `pnpm build`.

---

## M0 · Entrada
**Ruta:** `/[locale]`
- Splash con el logotipo «PÁSELE» en Bebas, sobre morado con papel picado (1.2 s, o se salta con un toque).
- Selector de idioma ES/EN y onboarding de 3 slides: *Descubre 340 mercados* · *Compra justo, del campo a tu mesa* · *Vive el mercado*.
- Selector de perfil con 4 tarjetas: Turista/Consumidor, Locatario, Productor, Gobierno.
- Franja de créditos: «Una iniciativa de SECTUR · SEDEMA · Secretaría de Economía · Gobierno de la CDMX» (logos placeholder).

**AC**
- [ ] El perfil y el idioma elegidos persisten al recargar.
- [ ] Si ya hay un perfil elegido, `/[locale]` redirige a su home: consumidor → `/explorar`, locatario → `/locatario`, productor → `/productor`, gobierno → `/gobierno`.
- [ ] `ProfileSwitcher` (botón flotante, arriba a la derecha y semitransparente) está disponible en todas las pantallas y cambia de perfil en 1 toque.

## M1 · Mapa de la ciudad
**Ruta:** `/explorar`
- Mapa a pantalla completa (MapLibre + CARTO Voyager) centrado en [19.40, -99.13], zoom 11, con botón «Mi ubicación». Si la geolocalización se niega, se usa el Zócalo.
- Los 346 mercados van con cluster. Los 22 destacados van en una capa aparte, con pin dorado más grande. El anillo del pin toma el color del giro principal.
- Buscador con resultados agrupados (Mercados · Puestos · Productos · Productores), sin acentos y tolerante a errores.
  - «pancita» → La Merced y Pancita Doña Chela.
  - «talavera» → La Ciudadela y San Juan Curiosidades.
  - «nopal» → Centro de Acopio y productores de Milpa Alta.
- Chips: Abierto ahora · Destacados · Comida · Flores · Artesanías · Pescados · Mayoreo. Además, «Filtros» (bottom sheet) con alcaldía (16, multiselección) y tipo.
- Al tocar un pin se abre un bottom sheet con nombre, lema, estado de horario, distancia, rating promedio de reseñas (si hay), «Ver mercado» y «Cómo llegar».
- Carrusel inferior «Rescata hoy» (M20) y «Cerca de ti», plegables.

**AC**
- [ ] 346 pines renderizados; el cluster se separa al hacer zoom; con zoom 15 o mayor no hay clusters.
- [ ] «Abierto ahora» usa `estadoHorario()` y excluye los mercados sin horario.
- [ ] El filtro de alcaldía «Xochimilco» deja solo mercados con `alcaldia === 'Xochimilco'`.
- [ ] «Cómo llegar» abre Google Maps con `destination=lat,lng&travelmode=transit`.
- [ ] Carga inicial del mapa en menos de 2.5 s en 4G simulado (el JSON se sirve estático y cacheado por el SW).

## M2 · Ficha de mercado
**Ruta:** `/mercado/[id]`
- Portada con placeholder (color del giro), título en Bebas, lema y chips de tipo.
- Bloque de info: horario (con estado y «cierra en X min» o «abre mañana 06:30»), dirección, transporte y el botón «Cómo llegar».
- Secciones: Imperdibles · Cifras (tarjetas de número grande) · Historia (acordeón) · Sub-mercados (La Merced) · Origen de sus productos · Fiesta patronal · Puestos (si hay interior) · Reseñas (M8) · Eventos relacionados (M10) · Rutas que pasan por aquí (M11).
- Si `interior_disponible`: botón protagonista «Ver mapa interior y llegar a un puesto».
- En mercados no destacados, estado vacío: «Este mercado aún no tiene puestos en línea» + «¿Eres locatario? Súmate gratis».
- Pie: «Fuente: Guía de Mercados CDMX 2026».

**AC**
- [ ] Las 346 fichas renderizan sin errores (test que recorre todos los ids).
- [ ] En `en` se muestran `lema_en` y `resumen_en` si existen.
- [ ] Botón de compartir (Web Share API, con fallback a copiar el link).

## M3 · Interior de La Merced
**Ruta:** `/mercado/la-merced/interior?puesto=&desde=`
- SVG con pan y zoom (pinch en móvil). Capas: calles, edificios (con nombre), pasillos, puestos (punto con color de giro; los reales llevan estrella dorada), accesos (ícono de Metro L1 en rosa `#E4007C`, puertas numeradas) y la leyenda «Plano esquemático».
- Buscador de puestos y productos, más chips por giro.
- Tocar un puesto abre una mini tarjeta con nombre, ubicación, rating, «Ver puesto» y «Llévame».
- «Llévame» pide el punto de partida (Metro Merced, Metro Candelaria o Circunvalación; default Metro Merced) y calcula con `rutaInterior()`.
  - Dibuja una polilínea morada animada.
  - Muestra el total («636 m · 9 min»).
  - Muestra la lista de pasos con el actual resaltado. «Siguiente» mueve el marcador «Estás aquí» al `hasta_nodo` del paso.
  - Al final: «¡Llegaste!» con confeti discreto y el botón «Ver menú del puesto».
- Deep link: `?puesto=pancita-dona-chela&desde=metro-merced` abre la ruta directamente.

**AC**
- [ ] Las 9 rutas precalculadas se dibujan idénticas; cualquier otro par se calcula con Dijkstra (tests en `tests/unit/routing.test.ts`).
- [ ] Buscar «pancita» resalta Pancita Doña Chela y centra el plano en ella.
- [ ] Las instrucciones cambian a inglés con el locale `en`.
- [ ] Usable con una mano: los controles de pasos quedan en el tercio inferior.

## M4 · Puesto
**Ruta:** `/puesto/[id]`
- Encabezado con nombre, ubicación, rating, número de reseñas, plan (solo visible en QA), sello de comercio justo, métodos de pago y horario.
- Catálogo: lista con precio y unidad, stepper de cantidad y «Agregar».
- «¿De dónde viene?»: tarjeta con el origen. Si hay `huerto_id`, enlaza al productor y muestra la barra de precio justo (M7).
- Botones «Cómo llegar dentro del mercado» (→ M3 con `?puesto=`) y «Hacer check-in» (→ M9).
- Reseñas (M8).

**AC**
- [ ] Solo se puede tener un carrito por puesto a la vez. Si se agrega de otro puesto, se pregunta si se crea otro pedido (el carrito soporta varios grupos).

## M5 · Carrito, checkout y pedido
**Rutas:** `/carrito` · `/checkout` · `/pedido/[folio]`
- FAB del carrito con badge; el carrito se agrupa por puesto.
- **Entrega:**
  - **Recoger en el puesto** (listo en 15–25 min).
  - **Envío con terceros:** tres opciones simuladas.

    | Proveedor | Precio | Tiempo |
    |---|---|---|
    | Rappi | $49 | 35 min |
    | Uber | $55 | 30 min |
    | 99 | $45 | 40 min |

    El costo se ajusta ±$10 según la distancia a la colonia elegida.
- **Resumen:**
  - Subtotal.
  - Tarifa de servicio: $9, tachada con Mercado+.
  - Envío.
  - Descuento: 10% con Pase Turista en puestos Pro o Plus.
  - Total en MXN, más ≈USD si el locale es `en`.
- **Pago:**
  - **CoDi / SPEI con QR:** QR real (`qrcode.react`) con un payload simulado, cuenta regresiva de 3 s y «Pago recibido».
  - **Tarjeta:** formulario con validación Luhn y la tarjeta de prueba 4242…; spinner de 1.5 s. Sin backend.
- **Confirmación `/pedido/[folio]`:**
  - Folio `PSL-XXXX`.
  - QR de recogida (si aplica).
  - Timeline de estado (Pagado → Preparando → Listo / En ruta), que avanza solo cada 8 s en modo demo.
  - Puntos ganados: `floor(total / 10)`, dobles si algún ítem tiene `huertoId`, con animación de sello.
  - Botón «Llévame al puesto».

**AC**
- [ ] El pedido se guarda en el store y aparece en Yo › Mis pedidos y en el panel del locatario (si el puesto es `pancita-dona-chela`).
- [ ] Los puntos se suman una sola vez por pedido.
- [ ] Nunca se envían datos de tarjeta a ninguna red (verificado en e2e con `page.route`).

## M6 · Mapa de huertos
**Rutas:** `/huertos` · `/huertos/[productorId]`
- Mapa con 8 polígonos verdes semitransparentes (invertir a `[lng, lat]`) y 14 pines de productor en verde nopal. Un toggle «Mostrar mercados» superpone M1 atenuado.
- Banner: «Más de la mitad de la CDMX es suelo de conservación. Compra directo a quien lo cuida».
- Chips: Nopal · Maíz nativo · Hortalizas de chinampa · Amaranto · Flores y plantas · Hongos · «De temporada ahora» (texto de temporada vs mes actual; basta una heurística con los nombres de los meses).
- **Ficha de zona:** descripción y cultivos.
- **Ficha de productor:**
  - Titular, pueblo, prácticas y temporada.
  - Catálogo.
  - Precio de mayoreo y venta mínima.
  - Entrega.
  - Barra de precio justo (M7).
  - «Comprar al mayoreo»: carrito con unidades de caja o ciento.
  - Si `visitas_huerto`, «Reservar visita» ($precio_visita, selector de fecha de los próximos 14 días, pago simulado).
  - Reseñas.

**AC**
- [ ] Los polígonos se ven en la ubicación correcta (sur de la CDMX), no en el océano.
- [ ] Comprar a un productor da puntos dobles.

## M7 · Del huerto a tu mesa (trazabilidad y precio justo)
Componente `<FairTradeCard productor producto />`, reutilizable en el puesto, el productor, la confirmación y el panel del productor.
- Recorrido ilustrado huerto → mercado → tú, con los km (`km_a_la_merced`) y el nombre de la familia o titular.
- **Barra de precio justo:** dos barras horizontales (con intermediarios vs con Pásele), con el % y los pesos. Copy:
  > «De cada $150 del ciento de nopal, $70 se quedan con la Familia Jurado Nopaleros (antes $35).»

**AC**
- [ ] Los valores salen de `comercio_justo`; el texto dice «el doble» cuando `mejora_pct ≥ 95`.
- [ ] Es accesible: las barras tienen texto equivalente para lector de pantalla.

## M8 · Reseñas
- Lista con estrellas, autor, origen, bandera de idioma, «Verificada por compra / check-in QR», fechas relativas y fotos placeholder.
- Filtro Todas / Español / English.
- «Escribir reseña»: estrellas, texto (mínimo 20 caracteres) y foto opcional (input file, preview local). Se guarda en el store y da +15 puntos (+ toast).

**AC**
- [ ] El rating promedio de un mercado o puesto combina el JSON con las reseñas propias.

## M9 · Pasaporte de Mercados
**Rutas:** `/yo` · `/yo/escanear`
- Pasaporte ilustrado con páginas de sellos: un sello circular en tinta morada con el nombre del mercado y la fecha. Arranca con los sellos de `usuario_demo`.
- Nivel actual, barra al siguiente nivel, insignias (bloqueadas o desbloqueadas, con su regla) y recompensas canjeables (restan puntos y generan un cupón con QR).
- **Escanear QR del puesto:** vista de cámara simulada con marco animado; tras 2 s detecta el puesto (elegible de una lista en modo demo).
  - Da +10 puntos, máximo 1 por puesto al día.
  - Si es el primer check-in en ese mercado: +50 puntos y un sello nuevo.
  - Tooltip: «Funciona aunque pagues en efectivo».
- Mis pedidos, recordatorios, plan actual y ajustes (idioma, reiniciar demo).

**AC**
- [ ] Un segundo check-in el mismo día en el mismo puesto muestra «Ya hiciste check-in hoy» y no suma.
- [ ] La insignia «Antojo chilango» se desbloquea al hacer check-in en Río Blanco, La Merced (pancita) y Jamaica Comidas.

## M10 · Agenda cultural
**Ruta:** `/agenda`
- Vista Lista (default, agrupada por mes) y vista Calendario mensual.
- Filtros: Tradición · Mercado · Feria de productores · Ciudad · Experiencia.
- Tarjeta con título, fechas («3–25 oct»), lugar y etiqueta «En curso» / «Próximo» / «Fecha por confirmar».
- Acciones «Recordarme» (toggle; guarda en el store y muestra toast), «Cómo llegar» y «Ver mercado».

**AC**
- [ ] El 1 de octubre de 2026, la Feria Nacional del Mole aparece «Próximo» (inicia el 3 de octubre); del 3 al 25 de octubre, «En curso».
- [ ] Los eventos pasados no se muestran. `recurrente` va al final, en «Siempre disponibles».

## M11 · Rutas y experiencias
**Rutas:** `/agenda?tab=rutas` · `/rutas/[id]`
- Tarjetas con mapa miniatura de las paradas, duración, km y candado dorado si es premium.
- Detalle: mapa con paradas numeradas y línea que las une, lista de paradas (enlaza a mercado o productor) y «Iniciar ruta».
  - Gratis, o premium con Pase Turista.
  - Si no se tiene el plan: paywall → M12.
- «Reservar versión guiada $precio_guiada»: fecha, personas y pago simulado.

**AC**
- [ ] Iniciar una ruta muestra un progreso de paradas que avanza con cada check-in en esos mercados.

## M12 · Planes
**Ruta:** `/yo/planes`
- Tabla comparativa Gratis / Pase Turista 7 días ($149) / Mercado+ ($49 al mes), desde `modelo_negocio.precios.consumidor`.
- «Activar» simula el pago y cambia `plan` en el store.

**AC**
- [ ] El plan afecta la tarifa de servicio, el límite del asistente, el acceso a rutas premium y el descuento.

## M20 · Rescata hoy
- Carrusel en Explorar con 4 productos próximos a perderse (se generan desde puestos de La Merced, CEDA y Jamaica): foto placeholder, «−40%», «Vence hoy 18:00», «Comprar» y «Donar a comedor comunitario».
- Contador «Toneladas rescatadas este mes» (= `metricas.kpis_hoy.alimento_rescatado_mes_ton`, sumado a las compras locales).

**AC**
- [ ] Comprar o donar suma kg al contador (estimado en el store) y lo refleja el panel de SEDEMA (M19).

## M22 · Asistente «Marchanta» 24/7
**Ruta:** `/asistente` (tab central)
- Chat con avatar de Marchanta y saludo:
  > «¡Pásele! Soy Marchanta, tu guía de mercados 24/7. ¿Qué se le antoja hoy?» (en inglés, si el locale es `en`).
- Chips de sugerencia, entrada de texto, micrófono (Web Speech API si existe; si no, oculto), indicador «escribiendo…» y respuestas con **tarjetas accionables**:
  - mercado → «Ver» / «Cómo llegar»
  - puesto → «Llévame» (M3)
  - productor → «Comprar»
  - evento → «Recordarme»
  - ruta → «Iniciar»
- **Intenciones mínimas del fallback (sin API key):**
  1. Comer X cerca: pancita, huaraches, carnitas, mariscos, quesadillas.
  2. Mercado abierto ahora o 24 horas.
  3. Llegar a un puesto: «How do I get to Doña Tere?».
  4. Comprar directo al productor (nopal, amaranto, verdura de chinampa).
  5. Eventos de este mes.
  6. Artesanías (talavera, alebrijes, plata).
  7. Qué es el comercio justo en la app.
  8. Cómo funcionan los puntos y el check-in en efectivo.
- **System prompt (con API key):**

  > Eres Marchanta, la asistente de Pásele, la app de los mercados públicos de la Ciudad de México. Hablas cálido, breve y claro, en el idioma del usuario (español mexicano o inglés). Solo recomiendas mercados, puestos, productores, eventos y rutas que aparezcan en el CONTEXTO; si algo no está, dilo y sugiere la alternativa más cercana del contexto. Nunca inventes horarios, precios ni direcciones. Considera la hora actual en CDMX ({ahora}) para decir si algo está abierto. Responde SOLO en JSON: {"text": string (máx. 90 palabras), "cards": [{"tipo":"mercado|puesto|productor|evento|ruta","id": string}] (máx. 3)}.
  > CONTEXTO: {json recortado}

- **Límite:** 20 mensajes al día en el plan Gratis. Aviso: «20 preguntas al día · ilimitado con Pase Turista».

**AC**
- [ ] Sin API key, las 8 intenciones responden con tarjetas válidas (ids existentes) en ES y en EN (tests unitarios de `intents.ts`).
- [ ] Con API key, las respuestas inválidas (JSON roto o ids inexistentes) caen al fallback sin romper la UI.
- [ ] «How do I get to Doña Tere?» devuelve la tarjeta del puesto `dona-tere`, y «Llévame» abre M3 con la ruta.

---

## M13 · Locatario › Hoy
**Ruta:** `/locatario`. Datos: `usuarios_demo.locatario` + estado local.
- «Buenos días, Doña Chela» (el saludo depende de la hora).
- KPIs del día: ventas, pedidos app, cobros QR, check-ins en efectivo y ticket promedio.
- Barras de la semana (Recharts).
- Top de productos, últimas reseñas y banner «Tus clientes en efectivo ya suman puntos: 37 check-ins hoy».

**AC**
- [ ] Los pedidos hechos en M5 a `pancita-dona-chela` aparecen aquí y en Pedidos.

## M14 · Locatario › Cobrar
- Teclado numérico grande → «Generar QR» → QR a pantalla completa con el monto y el nombre del puesto → a los 3 s, «Pago recibido $X» (check animado, vibración con `navigator.vibrate`) → «Compartir comprobante».
- Selector CoDi/SPEI o Tarjeta (link de pago). Leyenda «0% de comisión con QR».

**AC**
- [ ] El cobro suma a las ventas de hoy.

## M15 · Locatario › Catálogo
- Lista editable (precio y disponibilidad inline) y «Agregar producto» (nombre, precio, unidad, foto local y origen con selector de productor).
- En plan Gratis, el límite es de 20 productos: al pasarlo aparece un upsell a Pro.

## M16 · Locatario › Plan
- Gratis / Pro $149 / Plus $349 (`modelo_negocio.precios.locatario`) y una comparación de comisión: «Pásele 4% vs apps de delivery 18–30% + IVA». El plan actual va marcado.

## M17 · Productor › Cosecha
**Ruta:** `/productor`. Datos: `usuarios_demo.productor`.
- Lotes activos.
- «Publicar cosecha»: producto, cantidad, unidad, precio sugerido (± del mercado), fecha y foto.
- Vista previa «Así te verán los locatarios».

## M18 · Productor › Pedidos de mayoreo
- Estados: Nuevo → Confirmado → Listo para recoger / Enviado con terceros → Entregado, con acciones.
- «Mi huerto»: perfil público y `<FairTradeCard>` propia («Este mes recibiste el doble por kilo que con intermediarios»).

## M19 · Panel de gobierno
**Ruta:** `/gobierno`. Layout ancho a partir de 1024 px; en móvil, con scroll.
- Encabezado «Panel de impacto · Mercados Públicos CDMX», con chips SECTUR / SEDEMA / SE.
- KPIs (`kpis_hoy`) en números grandes.
- Mapa de adopción: mercados coloreados por `mercados_activos_en_app / mercados` de su alcaldía.
- Línea de `serie_mensual` (GMV y usuarios) y barras de `ventas_mes_mxn` por alcaldía.
- Pestañas por secretaría:
  - **SECTUR:** turistas e idiomas.
  - **SEDEMA:** CO₂, alimento rescatado (suma M20) y productores.
  - **SE:** derrama, locatarios y crédito.
- Top de mercados.
- Leyenda «Datos simulados · escenario piloto».
- Botón «Exportar CSV».

**AC**
- [ ] Los números cuadran con `metricas_gobierno.json`.
- [ ] Las gráficas usan la paleta de giros y tienen etiquetas legibles.

## Modo presentación
**Ruta:** `/presentacion`. Guion completo en `06_demo.md`.

**AC**
- [ ] Recorre los 10 pasos sin intervención manual, salvo el botón «Siguiente».
- [ ] «Reiniciar demo» deja todo como en los JSON.
