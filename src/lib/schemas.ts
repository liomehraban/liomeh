/**
 * Contratos de datos de Bara Bara.
 * Fuente: /data/*.json (mock). Validar con `pnpm validate:data`.
 * Cuando exista Supabase, SupabaseRepository debe devolver exactamente estos tipos.
 */
import { z } from "zod";

// ---------- comunes ----------
export const Horario = z.object({
  texto: z.string(),
  abre: z.string().regex(/^\d{2}:\d{2}$/),
  cierra: z.string().regex(/^\d{2}:\d{2}$/),
  /** 0 = domingo … 6 = sábado (convención JS Date.getDay) */
  dias: z.array(z.number().int().min(0).max(6)),
});
export type Horario = z.infer<typeof Horario>;

// ---------- mercados.json ----------
export const Mercado = z.object({
  id: z.string(),
  numero: z.string().nullable(),
  nombre: z.string(),
  nombre_display: z.string(),
  alcaldia: z.string(),
  direccion: z.string(),
  colonia: z.string(),
  cp: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  /** punto = verificado a mano · colonia = centroide de colonia · aproximada = match difuso */
  precision_ubicacion: z.enum(["punto", "colonia", "aproximada"]),
  categoria_guia: z.string(),
  tipos: z.array(z.string()),
  giros: z.array(z.string()),
  destacado: z.boolean(),
  fuente: z.string(),
  // solo destacados:
  lema: z.string().optional(),
  lema_en: z.string().optional(),
  resumen: z.string().optional(),
  resumen_en: z.string().optional(),
  historia: z.string().optional(),
  horario: Horario.optional(),
  imperdibles: z.array(z.string()).optional(),
  transporte: z.array(z.string()).optional(),
  cifras: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
  tiempo_sugerido_min: z.number().optional(),
  sub_mercados: z.array(z.string()).optional(),
  origen_producto: z.array(z.object({ estado: z.string(), productos: z.string() })).optional(),
  fiesta: z.object({ nombre: z.string(), fecha: z.string() }).optional(),
  programas: z.array(z.string()).optional(),
  interior_disponible: z.boolean().optional(),
  piloto: z.boolean().optional(),
  es_acopio: z.boolean().optional(),
  nota_datos: z.string().optional(),
});
export type Mercado = z.infer<typeof Mercado>;
export const Mercados = z.array(Mercado);

// ---------- la_merced_interior.json ----------
export const Producto = z.object({ n: z.string(), p: z.number(), u: z.string() });
export type Producto = z.infer<typeof Producto>;

export const Puesto = z.object({
  id: z.string(),
  nombre: z.string(),
  giro: z.string(),
  edificio: z.string(),
  nodo_cercano: z.string(),
  ubicacion_texto: z.string(),
  local: z.string(),
  x: z.number(),
  y: z.number(),
  productos: z.array(Producto),
  real_segun_guia: z.boolean(),
  simulado: z.boolean(),
  rating: z.number(),
  num_resenas: z.number(),
  acepta: z.array(z.string()),
  sello_comercio_justo: z.boolean(),
  plan: z.enum(["Gratis", "Pro", "Plus"]),
  horario: z.string(),
  destacado: z.boolean().optional(),
  origen: z
    .array(z.object({ producto: z.string(), lugar: z.string(), huerto_id: z.string().nullable() }))
    .optional(),
});
export type Puesto = z.infer<typeof Puesto>;

export const Nodo = z.object({ id: z.string(), x: z.number(), y: z.number(), label: z.string() });
export const Arista = z.object({ a: z.string(), b: z.string(), via: z.string(), m: z.number() });
export const Paso = z.object({ n: z.number(), instruccion: z.string(), metros: z.number(), hasta_nodo: z.string() });
export const RutaInterior = z.object({
  id: z.string(),
  desde: z.string(),
  hacia_puesto: z.string(),
  nodos: z.array(z.string()),
  pasos: z.array(Paso),
  distancia_m: z.number(),
  minutos_caminando: z.number(),
});
export type RutaInterior = z.infer<typeof RutaInterior>;

export const Interior = z.object({
  mercado_id: z.string(),
  nota: z.string(),
  lienzo: z.object({ w: z.number(), h: z.number(), unidad: z.string() }),
  edificios: z.array(
    z.object({
      id: z.string(), nombre: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number(),
      giro: z.string(), color: z.string(), nota: z.string().optional(), locatarios_aprox: z.number().optional(),
    }),
  ),
  calles: z.array(z.object({ nombre: z.string(), x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number() })),
  accesos: z.array(z.object({ id: z.string(), nombre: z.string(), x: z.number(), y: z.number(), tipo: z.enum(["metro", "calle", "puerta"]) })),
  grafo: z.object({ nodos: z.array(Nodo), aristas: z.array(Arista) }),
  puestos: z.array(Puesto),
  rutas_precalculadas: z.array(RutaInterior),
});
export type Interior = z.infer<typeof Interior>;

// ---------- huertos.json ----------
export const ZonaHuerto = z.object({
  id: z.string(), nombre: z.string(), alcaldia: z.string(), lat: z.number(), lng: z.number(), radio_km: z.number(),
  cultivos: z.array(z.string()), descripcion: z.string(),
  /** [lat, lng][] — invertir a [lng, lat] para GeoJSON */
  poligono_ilustrativo: z.array(z.tuple([z.number(), z.number()])),
});
export type ZonaHuerto = z.infer<typeof ZonaHuerto>;

export const Productor = z.object({
  id: z.string(), nombre: z.string(), titular: z.string(), pueblo: z.string(), alcaldia: z.string(), zona_id: z.string(),
  lat: z.number(), lng: z.number(), producto_principal: z.string(), catalogo: z.array(z.string()), temporada: z.string(),
  precio_mayoreo_app: z.object({ precio: z.number(), unidad: z.string() }),
  comercio_justo: z.object({
    precio_consumidor_final: z.number(), unidad: z.string(),
    productor_recibe_con_app: z.number(), productor_recibia_con_intermediarios: z.number(),
    mejora_pct: z.number(), participacion_productor_pct_app: z.number(), participacion_productor_pct_intermediarios: z.number(),
  }),
  venta_minima: z.string(), entrega: z.string(), visitas_huerto: z.boolean(), precio_visita: z.number(),
  rating: z.number(), num_resenas: z.number(), km_a_la_merced: z.number(), practicas: z.array(z.string()), simulado: z.boolean(),
});
export type Productor = z.infer<typeof Productor>;

export const Huertos = z.object({
  nota: z.string(),
  contexto: z.record(z.string(), z.unknown()),
  zonas: z.array(ZonaHuerto),
  productores: z.array(Productor),
});

// ---------- eventos.json ----------
export const Evento = z.object({
  id: z.string(), titulo: z.string(),
  /** ISO YYYY-MM-DD o "recurrente" */
  inicio: z.string(), fin: z.string().nullable(),
  lugar: z.string(), lat: z.number(), lng: z.number(),
  categoria: z.enum(["feria productores", "ciudad", "productores", "mercado", "tradición", "experiencia"]),
  descripcion: z.string(), fecha_confirmada: z.boolean(), mercado_id: z.string().nullable(),
});
export type Evento = z.infer<typeof Evento>;
export const Eventos = z.array(Evento);

// ---------- rutas_experiencias.json ----------
export const Ruta = z.object({
  id: z.string(), titulo: z.string(),
  /** ids de mercados.json o de productores (huertos.json) */
  paradas: z.array(z.string()),
  duracion_h: z.number(), km: z.number(), tipo: z.enum(["gratis", "premium"]), precio_guiada: z.number(),
  incluye: z.string().optional(),
});
export type Ruta = z.infer<typeof Ruta>;
export const Rutas = z.array(Ruta);

// ---------- lealtad.json ----------
export const Lealtad = z.object({
  programa: z.string(),
  como_se_gana: z.array(z.object({ accion: z.string(), puntos: z.string() })),
  niveles: z.array(z.object({ nivel: z.string(), desde: z.number(), beneficio: z.string() })),
  insignias: z.array(z.object({ id: z.string(), nombre: z.string(), regla: z.string() })),
  recompensas: z.array(z.object({ id: z.string(), titulo: z.string(), puntos: z.number() })),
  usuario_demo: z.object({
    nombre: z.string(), nivel: z.string(), puntos: z.number(), sellos: z.array(z.string()), insignias: z.array(z.string()),
  }),
});
export type Lealtad = z.infer<typeof Lealtad>;

// ---------- resenas.json ----------
export const Resena = z.object({
  id: z.string(), objetivo_id: z.string(), autor: z.string(), origen: z.string(), idioma: z.enum(["es", "en"]),
  estrellas: z.number().min(1).max(5), texto: z.string(), fecha: z.string(),
  verificada: z.enum(["compra", "check-in QR"]), fotos: z.number(), simulado: z.boolean(),
});
export type Resena = z.infer<typeof Resena>;
export const Resenas = z.array(Resena);

// ---------- usuarios_demo.json / metricas_gobierno.json / modelo_negocio.json ----------
// Estructuras de presentación: se tipan de forma laxa y se consumen tal cual en las vistas.
export const UsuariosDemo = z.object({
  turista: z.record(z.string(), z.unknown()),
  consumidora: z.record(z.string(), z.unknown()),
  locatario: z.object({
    puesto_id: z.string(), nombre: z.string(), plan: z.string(),
    hoy: z.object({ ventas_mxn: z.number(), pedidos_app: z.number(), cobros_qr: z.number(), checkins_efectivo: z.number(), ticket_promedio: z.number() }),
    semana: z.array(z.object({ d: z.string(), v: z.number() })),
    pedidos_pendientes: z.array(z.object({ id: z.string(), cliente: z.string(), items: z.string(), total: z.number(), tipo: z.string(), hora: z.string() })),
    top_productos: z.array(z.string()),
  }),
  productor: z.object({
    productor_id: z.string(), nombre: z.string(), plan: z.string(),
    lotes: z.array(z.object({ producto: z.string(), cantidad: z.number(), unidad: z.string(), precio: z.number(), disponible: z.string() })),
    pedidos_mayoreo: z.array(z.object({ cliente: z.string(), producto: z.string(), cantidad: z.string(), total: z.number(), estado: z.string() })),
  }),
});
export type UsuariosDemo = z.infer<typeof UsuariosDemo>;

export const MetricasGobierno = z.object({
  nota: z.string(),
  kpis_hoy: z.record(z.string(), z.number()),
  por_secretaria: z.record(z.string(), z.array(z.string())),
  por_alcaldia: z.array(z.object({
    alcaldia: z.string(), mercados: z.number(), mercados_activos_en_app: z.number(), locatarios_activos: z.number(),
    ventas_mes_mxn: z.number(), visitas_turistas_mes: z.number(),
  })),
  serie_mensual: z.array(z.object({
    mes: z.string(), gmv_mxn: z.number(), transacciones: z.number(), usuarios_activos: z.number(),
    turistas_extranjeros: z.number(), checkins_efectivo: z.number(), co2_evitado_ton: z.number(), alimento_rescatado_ton: z.number(),
  })),
  top_mercados: z.array(z.object({ id: z.string(), visitas_mes: z.number() })),
});
export type MetricasGobierno = z.infer<typeof MetricasGobierno>;

export const ModeloNegocio = z.object({
  principio: z.string(),
  precios: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
  comisiones: z.record(z.string(), z.string()),
  patrocinios: z.array(z.record(z.string(), z.unknown())),
  licencia_gobierno: z.record(z.string(), z.unknown()),
  proyeccion: z.array(z.object({ anio: z.number(), gmv_total: z.number(), ingresos: z.record(z.string(), z.number()), total: z.number(), pct_no_transaccional: z.number(), pct_gobierno: z.number() })),
}).passthrough();
export type ModeloNegocio = z.infer<typeof ModeloNegocio>;
