# 04 · Sistema de diseño (lineamientos CDMX)

Colores muestreados de la *Guía de Mercados CDMX 2026*: morado institucional y dorado, con acentos tomados de los colores del mercado.

## Tokens (CSS variables en `globals.css`, expuestas a Tailwind v4 con `@theme`)

```css
@theme {
  --color-morado: #9B2694;        /* primario: botones, tab activa, pines */
  --color-morado-700: #6E1A6A;    /* títulos */
  --color-morado-900: #3E1C3C;    /* fondos oscuros, texto sobre dorado */
  --color-morado-50: #F8E9F6;     /* superficies suaves */
  --color-dorado: #F2B01E;        /* premium, sellos, destacados */
  --color-dorado-200: #FDE9B5;
  --color-crema: #FEFAEB;         /* fondo cálido principal */
  --color-papel: #FBF7F2;         /* fondo secundario */
  --color-tinta: #2B1A2A;         /* texto principal */
  --color-tinta-2: #4A3848;       /* texto secundario */
  --color-gris: #8A7888;
  /* acentos de mercado (giros, chips, gráficas) */
  --color-chile: #C8102E;
  --color-nopal: #3C8D2F;
  --color-cempasuchil: #F29F05;
  --color-rosa: #E4007C;
  --color-anil: #1F4E9A;
  --radius-card: 20px;
  --radius-pill: 999px;
  --font-display: "Bebas Neue", "Oswald", sans-serif;
  --font-sans: "Public Sans", "Inter", system-ui, sans-serif;
}
```

- **Contraste:** el texto normal sobre morado es crema (#FEFAEB). Sobre dorado se usa morado-900. **Nunca** se usa texto dorado sobre crema en tamaños menores a 24 px.
- **Estados:** Abierto = nopal; Cerrado = gris con etiqueta de texto; «Por confirmar» = cempasúchil. El color nunca va solo: siempre acompañado de texto.

## Color por giro (pines, chips)

| Giro | Color |
|---|---|
| Comida | chile |
| Frutas y verduras / abasto general | nopal |
| Flores / plantas | rosa |
| Artesanías | añil |
| Pescados y mariscos | añil claro `#4F86C6` |
| Dulces | cempasúchil |
| Mayoreo | morado-900 |
| Otros | morado |

## Tipografía

- **Display:** *Bebas Neue* (Google Fonts), para nombres de mercados, números grandes y el logotipo. Evoca los títulos rotulados de la guía. Siempre en mayúsculas, con tracking de +1 px.
- **UI y texto:** *Public Sans*, pesos 400, 600 y 700.
- **Escala móvil:** display 48/36/28 · h1 24 · h2 20 · body 16 · caption 13 (mínimo 12).

## Componentes base

| Componente | Descripción |
|---|---|
| **Botón** | primario (morado, texto crema), secundario (borde morado), premium (dorado, texto morado-900) y fantasma. Altura 48 px, radio pill |
| **Chip de filtro** | seleccionable, con ícono y color de giro |
| **Tarjeta de mercado** | placeholder de foto 16:9 + nombre en Bebas + lema + estado + distancia + rating |
| **Bottom sheet** | con handle y 3 alturas (peek, mitad, completa) |
| **Tab bar** | 5 ítems; el botón central del Asistente es circular, elevado y dorado |
| **Sellos** | «Comercio justo» (dorado con ícono de mano y hoja), «Productor local CDMX» (nopal) y «Real · Guía CDMX» (morado, solo en QA) |
| **Placeholder fotográfico** | color sólido del giro (sin degradados) + patrón SVG de papel picado al 14% de opacidad + ícono del giro. **No se usan fotos reales de la guía** |
| **Papel picado** | separador SVG repetible (`public/papel-picado.svg`) en encabezados de ficha y onboarding |
| **Toasts** | puntos ganados (+10), recordatorio creado, pago recibido |
| **Marco de teléfono** | en desktop ≥ 768 px, device de 390×844 con radio de 48 px y sombra, sobre fondo crema con el logotipo y un QR «Abrir en tu teléfono» |

## Iconografía e ilustración

- **lucide-react**, trazo de 1.75 px y extremos redondeados.
- **Avatar de «Marchanta»:** ilustración SVG simple de una marchanta con mandil y canasta. Plana, 3 colores (morado, dorado, crema). **No es un robot.**

## Motion

- Transiciones de 200–300 ms con ease-out.
- El sello del pasaporte cae con un pequeño rebote.
- La ruta interior se anima con `stroke-dashoffset`.
- Se respeta `prefers-reduced-motion`.

## Voz y tono (copys)

- **Español:** tutea, es cálido y chilango sin caricatura («¡Pásele!», «¿Qué se le antoja?», «Llegaste»).
- **Inglés:** amable y claro; los nombres de platillos se quedan en español con explicación breve.
- Sin tecnicismos: «Cobra con QR», no «Genera un código de pago CoDi».
