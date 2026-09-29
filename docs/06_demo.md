# 06 · Guion de demo (modo presentación + e2e)

El modo presentación (`/presentacion`) muestra una barra inferior con el paso actual, el progreso (1/10) y los botones «Siguiente» y «Reiniciar demo». Cada paso navega y ejecuta sus acciones de forma programática, con animaciones visibles.

**Este mismo guion es el test e2e de Playwright** (`tests/e2e/demo.spec.ts`, viewport 390×844).

| # | Perfil | Acción | Lo que debe verse |
|---|---|---|---|
| 1 | Turista, EN (Emily) | Abrir Explorar y buscar «pancita» | El mapa centra La Merced; el bottom sheet muestra «Open now» si aplica |
| 2 | Turista | Ficha de La Merced → «See indoor map» | Plano de 8 naves; Pancita Doña Chela resaltada |
| 3 | Turista | «Take me there» desde Metro Merced | Ruta animada, 636 m · 9 min, 6 pasos en inglés; avanzar hasta «You've arrived» |
| 4 | Turista | Agregar 2 pancitas + 2 sopes → pagar con QR CoDi → recoger en puesto | QR de pago → «Payment received» → folio PSL-XXXX + sello y +30 puntos |
| 5 | Consumidora, ES (Sofía) | Huertos → Familia Jurado Nopaleros | Barra de precio justo: $70 vs $35 de $150, «el doble» |
| 6 | Consumidora | Asistente: «¿Qué eventos hay este mes?» | Tarjeta de la Feria Nacional del Mole (3–25 oct) + «Recordarme» |
| 7 | Consumidora | Yo → Escanear QR del puesto (pagó en efectivo en Jugos Moreno) | +10 puntos y toast «Funciona aunque pagues en efectivo» |
| 8 | Locatario (Doña Chela) | Hoy → aparece el pedido del paso 4 → Cobrar $250 con QR | KPIs actualizados; «Pago recibido $250» |
| 9 | Productor (Lucía) | Publicar cosecha: 200 lechugas a $12 | Lote nuevo visible en la vista previa |
| 10 | Gobierno | Panel → pestaña SEDEMA | KPIs, mapa de adopción, CO₂ y toneladas rescatadas |

**Aserciones clave del e2e**

- Paso 3: el número de pasos y la distancia coinciden con `rutas_precalculadas["metro-merced__pancita-dona-chela"]`.
- Paso 4: puntos = `floor(total / 10)`. En el paso 4, el total = 2×115 + 2×35 = $300, más $9 de servicio = $309 → 30 puntos.
- Paso 8: el pedido PSL-XXXX del paso 4 aparece en Pedidos del locatario.
- No hay errores en consola en todo el recorrido.
