/**
 * Catálogo simulado: puestos en línea para los mercados que no tienen datos de puestos en la guía.
 *
 * Todo es determinista (semilla = id del mercado): el mismo mercado genera siempre los mismos
 * puestos, así el servidor, el cliente y los deploys coinciden. Los puestos van marcados
 * `simulado: true`, como los simulados de La Merced. No se inventa nada de la guía: el giro sale de
 * los giros/tipos del mercado y el horario, del horario del mercado (vacío si la guía no lo trae).
 */
import type { Mercado, Producto, Puesto } from "./schemas";

// ---------- azar determinista ----------
export function hashTexto(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: PRNG pequeño y estable. */
export function azar(semilla: number) {
  let a = semilla >>> 0;
  const sig = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    sig,
    entero: (min: number, max: number) => min + Math.floor(sig() * (max - min + 1)),
    elegir: <T,>(xs: readonly T[]) => xs[Math.floor(sig() * xs.length)],
    /** k elementos distintos, en orden aleatorio */
    muestra: <T,>(xs: readonly T[], k: number) => {
      const c = [...xs];
      for (let i = c.length - 1; i > 0; i--) {
        const j = Math.floor(sig() * (i + 1));
        [c[i], c[j]] = [c[j], c[i]];
      }
      return c.slice(0, Math.min(k, c.length));
    },
  };
}

// ---------- plantillas por giro ----------
type P = readonly [nombre: string, precio: number, unidad: string];
type Plantilla = { giro: string; nombres: readonly string[]; productos: readonly P[]; min: number; max: number };

const FRUTAS: readonly P[] = [
  ["Jitomate saladet", 28, "kg"], ["Cebolla blanca", 26, "kg"], ["Chile serrano", 45, "kg"], ["Tomate verde", 30, "kg"],
  ["Papa blanca", 32, "kg"], ["Zanahoria", 20, "kg"], ["Calabacita", 28, "kg"], ["Aguacate hass", 75, "kg"],
  ["Limón sin semilla", 35, "kg"], ["Plátano tabasco", 24, "kg"], ["Papaya maradol", 25, "kg"], ["Piña", 22, "kg"],
  ["Mango ataulfo", 38, "kg"], ["Manzana roja", 48, "kg"], ["Naranja para jugo", 18, "kg"], ["Guayaba", 35, "kg"],
  ["Nopal limpio", 25, "kg"], ["Cilantro", 10, "manojo"], ["Epazote", 10, "manojo"], ["Chayote", 22, "kg"],
  ["Pepino", 20, "kg"], ["Elote", 12, "pieza"], ["Fresa", 60, "kg"], ["Sandía", 18, "kg"],
];

const PLANTILLAS = {
  frutas: { giro: "Frutas y verduras", nombres: ["Frutas {n}", "Verduras {n}", "La Huerta de {n}", "Frutería {n}"], productos: FRUTAS, min: 6, max: 9 },
  chiles: {
    giro: "Chiles secos y semillas",
    nombres: ["Chiles y Semillas {n}", "Semillas {n}"],
    productos: [["Chile guajillo", 180, "kg"], ["Chile ancho", 220, "kg"], ["Chile pasilla", 240, "kg"], ["Chile de árbol", 200, "kg"], ["Frijol negro", 38, "kg"], ["Arroz", 32, "kg"], ["Lenteja", 40, "kg"], ["Pepita de calabaza", 190, "kg"], ["Ajo", 90, "kg"], ["Cacahuate", 80, "kg"]],
    min: 5, max: 8,
  },
  polleria: {
    giro: "Pollería", nombres: ["Pollería {n}", "Pollos {n}"],
    productos: [["Pollo entero", 62, "kg"], ["Pechuga", 125, "kg"], ["Pierna y muslo", 78, "kg"], ["Alas", 85, "kg"], ["Huevo blanco", 48, "kg"], ["Milanesa de pollo", 150, "kg"]],
    min: 4, max: 6,
  },
  carniceria: {
    giro: "Carnicería", nombres: ["Carnicería {n}", "Carnes {n}"],
    productos: [["Bistec de res", 210, "kg"], ["Molida de res", 170, "kg"], ["Costilla de cerdo", 135, "kg"], ["Chuleta de cerdo", 120, "kg"], ["Arrachera", 320, "kg"], ["Chorizo", 140, "kg"], ["Cecina", 260, "kg"]],
    min: 4, max: 6,
  },
  pescaderia: {
    giro: "Pescadería", nombres: ["Pescados y Mariscos {n}", "Pescadería {n}"],
    productos: [["Mojarra", 110, "kg"], ["Filete de tilapia", 140, "kg"], ["Camarón mediano", 280, "kg"], ["Pulpo", 260, "kg"], ["Huachinango", 230, "kg"], ["Robalo", 250, "kg"], ["Almeja", 120, "kg"]],
    min: 4, max: 6,
  },
  cremeria: {
    giro: "Cremería", nombres: ["Cremería {n}", "Quesos {n}"],
    productos: [["Queso Oaxaca", 160, "kg"], ["Queso panela", 130, "kg"], ["Crema de rancho", 70, "L"], ["Queso Cotija", 190, "kg"], ["Jamón de pierna", 150, "kg"], ["Mantequilla", 180, "kg"], ["Yogur natural", 45, "L"]],
    min: 4, max: 6,
  },
  abarrotes: {
    giro: "Abarrotes", nombres: ["Abarrotes {n}", "La Tiendita de {n}"],
    productos: [["Aceite (1 L)", 45, "pieza"], ["Azúcar", 32, "kg"], ["Café de olla", 190, "kg"], ["Sal de mar", 20, "kg"], ["Chocolate de mesa", 60, "tablilla"], ["Piloncillo", 40, "kg"], ["Pasta para sopa", 15, "paquete"], ["Harina de trigo", 24, "kg"]],
    min: 5, max: 7,
  },
  tortilleria: {
    giro: "Molino / masa", nombres: ["Tortillería {n}", "Molino {n}"],
    productos: [["Tortilla de maíz", 24, "kg"], ["Masa fresca de maíz", 22, "kg"], ["Tortilla hecha a mano", 35, "docena"], ["Masa azul", 30, "kg"], ["Totopos", 40, "bolsa"], ["Tlacoyo de frijol", 25, "pieza"]],
    min: 3, max: 5,
  },
  fonda: {
    giro: "Comida corrida", nombres: ["Fonda {n}", "Cocina {n}", "Comedor {n}"],
    productos: [["Comida corrida (sopa, arroz, guisado, agua)", 85, "menú"], ["Chilaquiles con pollo", 90, "plato"], ["Enchiladas verdes", 95, "plato"], ["Huevos al gusto", 70, "plato"], ["Caldo de gallina", 95, "plato"], ["Mole con arroz", 110, "plato"], ["Agua fresca", 25, "vaso"]],
    min: 4, max: 6,
  },
  antojitos: {
    giro: "Antojitos", nombres: ["Antojitos {n}", "Quesadillas {n}", "Tacos {n}"],
    productos: [["Quesadilla de flor de calabaza", 40, "pieza"], ["Quesadilla de huitlacoche", 45, "pieza"], ["Sope", 35, "pieza"], ["Huarache sencillo", 60, "pieza"], ["Taco de guisado", 22, "pieza"], ["Tlacoyo", 30, "pieza"], ["Pambazo", 45, "pieza"]],
    min: 4, max: 6,
  },
  jugos: {
    giro: "Jugos / postres", nombres: ["Jugos {n}", "Licuados {n}"],
    productos: [["Jugo de naranja", 40, "vaso 1/2 L"], ["Jugo verde", 45, "vaso 1/2 L"], ["Licuado de plátano", 45, "vaso"], ["Fresas con crema", 65, "vaso"], ["Coctel de frutas", 55, "vaso"], ["Escamocha", 70, "vaso"]],
    min: 4, max: 6,
  },
  flores: {
    giro: "Flores", nombres: ["Flores {n}", "Florería {n}"],
    productos: [["Rosas", 180, "docena"], ["Gerberas", 120, "docena"], ["Nube (paniculata)", 90, "manojo"], ["Girasoles", 150, "docena"], ["Alcatraces", 200, "docena"], ["Arreglo mediano", 350, "pieza"], ["Lilis", 160, "manojo"]],
    min: 4, max: 6,
  },
  plantas: {
    giro: "Plantas y viveros", nombres: ["Vivero {n}", "Plantas {n}"],
    productos: [["Suculenta en maceta", 45, "pieza"], ["Helecho colgante", 120, "pieza"], ["Hierbas de olor (maceta)", 60, "pieza"], ["Tierra preparada", 50, "bulto"], ["Maceta de barro", 80, "pieza"], ["Orquídea", 280, "pieza"], ["Árbol de limón", 350, "pieza"]],
    min: 4, max: 6,
  },
  artesanias: {
    giro: "Artesanías", nombres: ["Artesanías {n}", "Arte Popular {n}"],
    productos: [["Alebrije pequeño", 350, "pieza"], ["Plato de talavera", 280, "pieza"], ["Rebozo", 650, "pieza"], ["Barro negro (jarrón)", 420, "pieza"], ["Muñeca otomí", 220, "pieza"], ["Huipil bordado", 950, "pieza"], ["Aretes de plata", 380, "par"]],
    min: 4, max: 6,
  },
  ropa: {
    giro: "Ropa y calzado", nombres: ["Ropa {n}", "Calzado {n}", "Boutique {n}"],
    productos: [["Playera de algodón", 150, "pieza"], ["Pantalón de mezclilla", 380, "pieza"], ["Huaraches de piel", 450, "par"], ["Sudadera", 320, "pieza"], ["Calcetas (3 pares)", 90, "paquete"], ["Tenis", 550, "par"]],
    min: 4, max: 6,
  },
  dulces: {
    giro: "Dulces mexicanos", nombres: ["Dulces {n}", "Dulcería {n}"],
    productos: [["Alegría de amaranto", 15, "pieza"], ["Cocada", 20, "pieza"], ["Jamoncillo", 18, "pieza"], ["Fruta cristalizada", 180, "kg"], ["Dulce de tamarindo", 12, "pieza"], ["Mazapán (caja)", 85, "caja"], ["Obleas", 25, "paquete"]],
    min: 4, max: 6,
  },
  hierbas: {
    giro: "Hierbas y esotérico", nombres: ["Hierbas {n}", "Yerbería {n}"],
    productos: [["Manzanilla", 15, "manojo"], ["Hierbabuena", 12, "manojo"], ["Ruda", 15, "manojo"], ["Veladora", 35, "pieza"], ["Copal", 60, "bolsa"], ["Té de tila", 20, "bolsa"], ["Árnica", 25, "bolsa"]],
    min: 4, max: 6,
  },
  hogar: {
    giro: "Hogar y cocina", nombres: ["Jarcería {n}", "Hogar {n}"],
    productos: [["Molcajete de piedra", 350, "pieza"], ["Comal de barro", 120, "pieza"], ["Olla de peltre", 280, "pieza"], ["Escoba de mijo", 85, "pieza"], ["Canasta de palma", 120, "pieza"], ["Cubeta 20 L", 75, "pieza"]],
    min: 4, max: 6,
  },
  religioso: {
    giro: "Artículos religiosos", nombres: ["Artículos Religiosos {n}", "Santería {n}"],
    productos: [["Imagen de la Virgen (pequeña)", 180, "pieza"], ["Rosario", 60, "pieza"], ["Veladora", 35, "pieza"], ["Estampas", 10, "pieza"], ["Vela de cera", 45, "pieza"]],
    min: 3, max: 5,
  },
  gourmet: {
    giro: "Gourmet e internacional", nombres: ["Delicatessen {n}", "Gourmet {n}"],
    productos: [["Queso manchego", 380, "kg"], ["Aceite de oliva (500 ml)", 220, "pieza"], ["Salami", 420, "kg"], ["Especias importadas", 90, "frasco"], ["Café de especialidad", 320, "kg"], ["Pan de masa madre", 95, "pieza"]],
    min: 4, max: 6,
  },
  muebles: {
    giro: "Muebles", nombres: ["Muebles {n}", "Mueblería {n}"],
    productos: [["Silla de madera", 850, "pieza"], ["Banco de tule", 450, "pieza"], ["Mesa de centro", 1800, "pieza"], ["Repisa", 380, "pieza"], ["Baúl pequeño", 950, "pieza"]],
    min: 3, max: 5,
  },
  mayoreo: {
    giro: "Frutas y verduras (mayoreo)", nombres: ["Bodega {n}", "Distribuidora {n}"],
    productos: [["Jitomate saladet", 380, "caja 20 kg"], ["Aguacate hass", 1200, "caja 20 kg"], ["Cebolla blanca", 420, "bulto 25 kg"], ["Papa blanca", 650, "bulto 25 kg"], ["Limón sin semilla", 520, "caja 20 kg"], ["Naranja", 280, "caja 25 kg"], ["Plátano tabasco", 360, "caja 18 kg"]],
    min: 5, max: 7,
  },
} as const satisfies Record<string, Plantilla>;

export type ClavePlantilla = keyof typeof PLANTILLAS;

const APODOS = [
  "Doña Mary", "Don Beto", "Los Güeros", "La Güera", "Doña Lupita", "Don Chucho", "Hermanos Ramírez", "Doña Chayo",
  "El Güero", "Don Pepe", "Doña Toña", "La Morena", "Doña Carmen", "Don Juan", "Los Primos", "Doña Rosa",
  "Don Toño", "La Flaca", "Doña Elvira", "Don Memo", "Hermanos López", "Doña Paty", "Don Lalo", "La Cuñada",
];

/** Mezcla de giros de un mercado tradicional sin giros en la guía. */
const MEZCLA_TRADICIONAL: ClavePlantilla[] = ["frutas", "frutas", "polleria", "carniceria", "cremeria", "abarrotes", "tortilleria", "fonda", "jugos", "antojitos", "flores", "chiles", "frutas", "hogar", "dulces"];

const POR_GIRO: Record<string, ClavePlantilla[]> = {
  comida: ["fonda", "antojitos", "jugos", "fonda", "antojitos"],
  "abasto general": ["frutas", "frutas", "polleria", "carniceria", "cremeria", "abarrotes", "chiles"],
  flores: ["flores", "flores", "flores", "plantas"],
  "ropa y calzado": ["ropa", "ropa", "ropa"],
  artesanías: ["artesanias", "artesanias", "artesanias", "dulces"],
  plantas: ["plantas", "plantas", "flores"],
  "pescados y mariscos": ["pescaderia", "pescaderia", "pescaderia", "fonda"],
  arte: ["artesanias", "artesanias"],
  dulces: ["dulces", "dulces"],
  "hierbas y esotérico": ["hierbas", "hierbas", "religioso"],
  mayoreo: ["mayoreo", "mayoreo", "mayoreo"],
  internacional: ["gourmet", "gourmet"],
  gourmet: ["gourmet", "gourmet"],
  religioso: ["religioso", "religioso"],
  muebles: ["muebles", "muebles"],
  "productores locales": ["frutas", "frutas"],
  "frutas y legumbres": ["frutas", "frutas", "frutas"],
  abarrotes: ["abarrotes", "abarrotes"],
  cárnicos: ["carniceria", "polleria"],
  nopal: ["frutas"],
  verdura: ["frutas", "frutas"],
};

/** Giros (plantillas) del mercado, en orden, con los de su guía primero. */
export function mezclaDelMercado(m: Pick<Mercado, "giros" | "tipos">): ClavePlantilla[] {
  const desdeGiros = m.giros.flatMap((g) => POR_GIRO[g.toLowerCase()] ?? []);
  if (m.tipos.includes("mayorista")) return [...desdeGiros, "mayoreo", "mayoreo", "mayoreo", "frutas", "chiles"];
  if (desdeGiros.length === 0) return MEZCLA_TRADICIONAL;
  // Los especializados se quedan en su giro; los demás también tienen su abasto básico.
  return m.tipos.includes("especializado") ? desdeGiros : [...desdeGiros, ...MEZCLA_TRADICIONAL.slice(0, 6)];
}

/** Precio con variación ±12 %, redondeado (a $5 arriba de $60). */
function variar(precio: number, r: ReturnType<typeof azar>): number {
  const p = precio * (0.88 + r.sig() * 0.24);
  return Math.max(5, p > 60 ? Math.round(p / 5) * 5 : Math.round(p));
}

export const SEPARADOR_SIMULADO = "--";
export const esPuestoSimulado = (id: string) => id.includes(SEPARADOR_SIMULADO);
export const mercadoDePuestoSimulado = (id: string) => id.split(SEPARADOR_SIMULADO)[0];

const horarioPuesto = (m: Pick<Mercado, "horario">) => (m.horario ? `${m.horario.abre}–${m.horario.cierra}` : "");

/**
 * Puestos simulados del mercado: 6–10 (10–14 en turísticos, destacados y mayoristas), con giros
 * según la mezcla del mercado y productos de su plantilla.
 */
export function puestosSimulados(m: Pick<Mercado, "id" | "giros" | "tipos" | "destacado" | "horario">): Puesto[] {
  const r = azar(hashTexto(m.id));
  const grande = m.destacado || m.tipos.includes("turístico") || m.tipos.includes("mayorista");
  const n = grande ? r.entero(10, 14) : r.entero(6, 10);
  const mezcla = mezclaDelMercado(m);
  const apodos = r.muestra(APODOS, APODOS.length);
  const pasillos = "ABCDEF";
  return Array.from({ length: n }, (_, k) => {
    const clave = mezcla[k % mezcla.length];
    const t: Plantilla = PLANTILLAS[clave];
    const productos: Producto[] = r
      .muestra(t.productos, r.entero(t.min, t.max))
      .map(([nombre, precio, u]) => ({ n: nombre, p: variar(precio, r), u }));
    const local = `${pasillos[k % pasillos.length]}-${String(r.entero(1, 180)).padStart(3, "0")}`;
    const plan = r.sig() < 0.7 ? "Gratis" : r.sig() < 0.75 ? "Pro" : "Plus";
    return {
      id: `${m.id}${SEPARADOR_SIMULADO}${k + 1}`,
      nombre: r.elegir(t.nombres).replace("{n}", apodos[k % apodos.length]),
      giro: t.giro,
      edificio: "general",
      nodo_cercano: "",
      ubicacion_texto: `Pasillo ${pasillos[k % pasillos.length]} · Local ${local}`,
      local,
      x: 0,
      y: 0,
      productos,
      real_segun_guia: false,
      simulado: true,
      rating: Math.round((4.1 + r.sig() * 0.8) * 10) / 10,
      num_resenas: r.entero(12, 640),
      acepta: r.sig() < 0.6 ? ["QR CoDi/SPEI", "Tarjeta", "Efectivo"] : ["QR CoDi/SPEI", "Efectivo"],
      sello_comercio_justo: clave === "frutas" && r.sig() < 0.25,
      plan,
      horario: horarioPuesto(m),
    } satisfies Puesto;
  });
}
