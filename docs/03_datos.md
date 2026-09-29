# 03 · Datos

Todos los contratos están en `src/lib/schemas.ts` (zod). La validación completa se corre con `pnpm validate:data`, que revisa esquemas y referencias cruzadas.

## Archivos

| Archivo | Tipo | Registros | Real / simulado |
|---|---|---|---|
| `mercados.json` | `Mercado[]` | 346 (340 del directorio oficial + CEDA, La Nueva Viga, La Ciudadela, Granaditas y el Centro de Acopio del Nopal) | **Real** (Guía de Mercados CDMX 2026). Coordenadas geocodificadas |
| `la_merced_interior.json` | `Interior` | 8 edificios, 66 nodos, 97 aristas, 56 puestos, 9 rutas | Naves, accesos y giros reales; 5 puestos reales; el resto, simulado |
| `huertos.json` | `{zonas, productores}` | 8 zonas, 14 productores | Zonas reales (polígono ilustrativo); productores simulados |
| `eventos.json` | `Evento[]` | 18 | Reales (`fecha_confirmada=false` = fecha estimada) |
| `rutas_experiencias.json` | `Ruta[]` | 6 | Propuesta |
| `lealtad.json` | `Lealtad` | — | Propuesta |
| `resenas.json` | `Resena[]` | 22 | Simulado |
| `usuarios_demo.json` | `UsuariosDemo` | — | Simulado |
| `metricas_gobierno.json` | `MetricasGobierno` | — | Proyección simulada (kpis = mes 6 del piloto) |
| `modelo_negocio.json` | `ModeloNegocio` | — | Propuesta Cinética |
| `mercados_cdmx.csv` | — | 346 | Export plano de `mercados.json` (para Excel o QA) |

## Mercados: notas de uso

- **`destacado=true` (22):** traen `lema`, `resumen`, `horario`, `imperdibles` y, en algunos casos, `historia`, `transporte`, `cifras`, `sub_mercados`, `fiesta` y `programas`. Los otros 324 solo tienen datos de directorio, así que la UI debe verse bien también con pocos datos.
- **`precision_ubicacion`:**
  - `punto` (38): verificado a mano.
  - `colonia`: centroide del código postal de la colonia, con un pequeño jitter para que no se encimen.
  - `aproximada` (10): coincidencia difusa.
  - No se muestra al usuario. Sí se muestra en una herramienta de QA opcional.
- **`horario`** existe solo en los destacados. En los demás, «Horario no disponible · Pregunta en el mercado» y no participan en el filtro «Abierto ahora», o se tratan como desconocidos.
- **`interior_disponible=true`:** solo `la-merced`.
- **Ids:** slugs ASCII (`la-merced`, `77-san-juan-ernesto-pugibet`). **El `numero` oficial NO es único:** la guía repite 108, 378 y 394.
- **Inconsistencia de la guía:** Villa Lázaro Cárdenas aparece como #0072 en su ficha y como #265 en el directorio. Se usa el 265 (ver `nota_datos`).

## Interior: sistema de coordenadas y ruteo

- Lienzo de 1200×800. `x` crece hacia el este y `y` hacia abajo (sur). Es esquemático: 1 unidad equivale aproximadamente a 1 m.
- `grafo.aristas[].m` es la distancia euclidiana precalculada.
- **Algoritmo de instrucciones** (la implementación de referencia está en `src/lib/routing.ts`, con test):
  1. Dijkstra con pesos euclidianos.
  2. Agrupar segmentos consecutivos con el mismo `via`.
  3. Redondear los metros a múltiplos de 5.
  4. Calcular el giro con el producto cruz de los dos vectores de dirección. Si el ángulo es menor a 35°, «Sigue derecho»; si `c > 0`, derecha; si no, izquierda (la y apunta hacia abajo).
  5. Paso final: «Llegaste: {nombre} está a tu lado ({ubicacion_texto})».
  6. Minutos = `max(1, round(m / 70))`.
- **Puestos reales según la guía:**
  - `dona-tere`: Desayunos Doña Tere (Puerta 14)
  - `pancita-dona-chela` (Puerta 14)
  - `tacos-cabeza-p15`
  - `jugos-moreno`
  - `molino-comidas`

## Huertos

- `poligono_ilustrativo` viene como `[lat, lng][]`. **Hay que invertirlo** a `[lng, lat]` y cerrar el anillo para GeoJSON.
- `comercio_justo.participacion_productor_pct_app` vs `_intermediarios` alimentan la barra de precio justo (M7).
- `km_a_la_merced` es la distancia aproximada en línea recta al Mercado de La Merced.

## Eventos

- `inicio`/`fin` vienen en ISO; `inicio="recurrente"` con `fin=null` es una experiencia permanente.
- Ordenar desde hoy. Estado: «En curso» si hoy cae entre `inicio` y `fin`, «Próximo» si es futuro, y se ocultan los pasados.

## Estado local (Zustand, persistido)

```ts
{
  perfil: 'consumidor'|'locatario'|'productor'|'gobierno',
  locale: 'es'|'en',
  plan: 'Gratis'|'Pase Turista'|'Mercado+',
  carrito: { puestoId: string, items: { nombre: string, precio: number, unidad: string, qty: number, huertoId?: string }[] }[],
  pedidos: Pedido[],                  // creados en checkout
  puntos: number,                     // arranca en lealtad.usuario_demo.puntos
  sellos: string[],                   // ids de mercado
  insignias: string[],
  recordatorios: string[],            // ids de evento
  resenasPropias: Resena[],
  checkinsHoy: Record<string, string>,// puestoId → fecha ISO (máx. 1 por día)
  asistente: { fecha: string, usados: number },
  locatario: { pedidos: …, catalogoExtra: Producto[], cobros: … },
  productor: { lotes: …, pedidos: … }
}
```

Incluye un botón «Reiniciar demo» (en Yo › Ajustes y en el modo presentación) que restablece todo desde los JSON.
