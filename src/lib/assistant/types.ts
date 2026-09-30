import type { Evento, Lealtad, Mercado, Productor, Puesto, Ruta } from "../schemas";

export const TIPOS_CARD = ["mercado", "puesto", "productor", "evento", "ruta"] as const;
export type TipoCard = (typeof TIPOS_CARD)[number];

export type Card = { tipo: TipoCard; id: string };

export type Intencion = "comida" | "abierto" | "llegar" | "productor" | "eventos" | "artesanias" | "comercioJusto" | "puntos" | "ayuda";

export type PuestoConMercado = Puesto & { mercadoId: string };

export type DatosAsistente = {
  mercados: Mercado[];
  puestos: PuestoConMercado[];
  productores: Productor[];
  eventos: Evento[];
  rutas: Ruta[];
  lealtad: Lealtad;
};

export type Locale = "es" | "en";
export type Ubicacion = { lat: number; lng: number };

/** Tarjeta lista para pintar en el chat (resuelta en el servidor). */
export type TarjetaResuelta = Card & {
  titulo: string;
  subtitulo?: string;
  lat?: number;
  lng?: number;
  /** Para «Llévame» de puestos: mercado con interior. */
  mercadoId?: string;
};

/** Respuesta preguardada de Marchanta (se calcula en el servidor con las reglas de intents.ts). */
export type RespuestaAsistente = { text: string; cards: TarjetaResuelta[]; intencion: Intencion };
