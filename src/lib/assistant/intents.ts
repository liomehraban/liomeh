/**
 * Fallback del asistente «Marchanta» (sin API key o si la IA falla): reglas por palabras clave, ES y EN.
 * Calcula de verdad «abierto ahora», distancias y fechas con los datos del repositorio.
 */
import { etiquetaEvento, eventosVigentes, formatRangoFechas, hoyCDMX } from "../eventos";
import { precioJusto } from "../fairtrade";
import { formatDistance, haversine, ZOCALO } from "../geo";
import { estadoHorario } from "../horario";
import { enIdioma } from "../idioma";
import { formatMXN } from "../money";
import { levenshtein, normalizar, tokenizar } from "../search";
import type { Mercado } from "../schemas";
import type { Card, DatosAsistente, Intencion, Locale, PuestoConMercado, Ubicacion } from "./types";

type Opciones = { locale: Locale; now?: Date; ubicacion?: Ubicacion | null };
export type ResultadoIntencion = { intencion: Intencion; text: string; cards: Card[] };

const tiene = (t: string, ...patrones: RegExp[]) => patrones.some((p) => p.test(t));

// ---------- detección ----------

const PLATILLOS: { clave: string; re: RegExp; buscar: RegExp }[] = [
  { clave: "pancita", re: /\b(pancita|menudo|mondongo|tripe)\b/, buscar: /pancita/ },
  { clave: "huaraches", re: /\bhuarache/, buscar: /huarache/ },
  { clave: "carnitas", re: /\bcarnitas\b/, buscar: /carnitas/ },
  { clave: "mariscos", re: /\b(mariscos?|seafood|pescad\w*|fish|pulpo|octopus)\b/, buscar: /marisc|pescad|pulpo/ },
  { clave: "quesadillas", re: /\bquesadillas?\b/, buscar: /quesadilla/ },
  { clave: "tacos", re: /\btacos?\b/, buscar: /taco/ },
  { clave: "tamales", re: /\btamal(es)?\b/, buscar: /tamal/ },
  { clave: "jugos", re: /\b(jugos?|licuados?|juice|smoothies?)\b/, buscar: /jugo|licuado/ },
];

export function detectarIntencion(mensaje: string): Intencion {
  const t = normalizar(mensaje);
  if (tiene(t, /\b(como llego|como llegar|llevame|llegar a|donde esta|donde queda|how do i get|get to|take me|where is|directions to)\b/)) return "llegar";
  if (tiene(t, /comercio justo|precio justo|fair trade|fair price|intermediari|middlem/)) return "comercioJusto";
  if (tiene(t, /\b(puntos?|points?|check ?in|checkin|pasaporte|passport|sellos?|stamps?|lealtad|loyalty)\b|efectivo|\bcash\b/)) return "puntos";
  if (tiene(t, /\b(eventos?|events?|feria|fair|fiesta|festival|agenda|que hay este mes|this month|desfile|parade)\b/)) return "eventos";
  if (tiene(t, /artesan|craft|talavera|alebrije|\bplata\b|silver|souvenir|recuerdo|textil|bordad/)) return "artesanias";
  if (tiene(t, /productor|grower|farmer|\bfarm\b|huerto|chinampa|directo|direct|mayoreo|wholesale|amaranto|amaranth|\bnopal/)) return "productor";
  if (tiene(t, /abiert|\bopen\b|24 ?h|24 horas|24 hours|all night|madrugada/)) return "abierto";
  if (PLATILLOS.some((p) => p.re.test(t)) || tiene(t, /\b(comer|como|desayun|antoj|hambre|eat|food|breakfast|hungry)\b/)) return "comida";
  return "ayuda";
}

// ---------- utilidades ----------

const origen = (o: Opciones) => o.ubicacion ?? ZOCALO;
const desde = (o: Opciones) => (o.ubicacion ? "" : o.locale === "en" ? " from the Zócalo" : " desde el Zócalo");
/** Aclaración de distancias cuando no hay ubicación: « (distancias desde el Zócalo)». */
const distanciasDesde = (o: Opciones) => (o.ubicacion ? "" : o.locale === "en" ? " (distances from the Zócalo)" : " (distancias desde el Zócalo)");
/** Unidades de /data en inglés para las respuestas (las pantallas usan messages › datos.unidades). */
const UNIDAD_EN: Record<string, string> = { ciento: "100 pcs", maceta: "pot", pieza: "piece", manojo: "bunch", caja: "box" };
const unidad = (u: string, o: Opciones) => (o.locale === "en" ? (UNIDAD_EN[u] ?? u) : u);
const dist = (o: Opciones, p: { lat: number; lng: number }) => formatDistance(haversine(origen(o), p), o.locale);

function estadoTexto(m: Mercado, o: Opciones): string {
  const e = estadoHorario(m.horario, o.now);
  const en = o.locale === "en";
  if (e.estado === "abierto") return e.es24h ? (en ? "open 24 h" : "abierto 24 h") : en ? "open now" : "abierto ahora";
  if (e.estado === "cerrado") return en ? `closed, opens at ${e.abre}` : `cerrado, abre a las ${e.abre}`;
  return en ? "hours not available" : "horario no disponible";
}

const lista = (xs: string[], locale: Locale) => {
  if (xs.length <= 1) return xs.join("");
  const y = locale === "en" ? " and " : " y ";
  return `${xs.slice(0, -1).join(", ")}${y}${xs.at(-1)}`;
};

/** Ordena abiertos primero y luego por distancia. */
function ordenar<T extends { lat: number; lng: number }>(xs: T[], o: Opciones, abierto: (x: T) => boolean): T[] {
  return [...xs].sort((a, b) => Number(abierto(b)) - Number(abierto(a)) || haversine(origen(o), a) - haversine(origen(o), b));
}

const mercadoDe = (d: DatosAsistente, id: string) => d.mercados.find((m) => m.id === id);

// ---------- intenciones ----------

function comida(msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const t = normalizar(msg);
  const en = o.locale === "en";
  const plat = PLATILLOS.find((p) => p.re.test(t));
  if (!plat) {
    // sin platillo: mercados de comida abiertos y cercanos
    const ms = ordenar(d.mercados.filter((m) => m.giros.includes("comida") && m.horario), o, (m) => estadoHorario(m.horario, o.now).estado === "abierto").slice(0, 3);
    return {
      intencion: "comida",
      text: en
        ? `Hungry? These food markets are nearby${distanciasDesde(o)}: ${lista(ms.map((m) => `${m.nombre_display} (${estadoTexto(m, o)}, ${dist(o, m)})`), "en")}.`
        : `¿Qué se le antoja? Estos mercados de comida te quedan cerca${distanciasDesde(o)}: ${lista(ms.map((m) => `${m.nombre_display} (${estadoTexto(m, o)}, ${dist(o, m)})`), "es")}.`,
      cards: ms.map((m) => ({ tipo: "mercado", id: m.id })),
    };
  }
  const puestos = d.puestos.filter((p) => plat.buscar.test(normalizar([p.nombre, p.giro, ...p.productos.map((x) => x.n)].join(" "))));
  const mercados = d.mercados.filter((m) => plat.buscar.test(normalizar([...(m.imperdibles ?? []), m.resumen ?? "", ...m.giros].join(" "))));
  const abierto = (m: { horario?: Mercado["horario"] }) => estadoHorario(m.horario, o.now).estado === "abierto";
  const ms = ordenar(mercados, o, abierto);
  const conMercado = (p: PuestoConMercado) => ({ ...p, lat: mercadoDe(d, p.mercadoId)!.lat, lng: mercadoDe(d, p.mercadoId)!.lng });
  const ps = ordenar(puestos.map(conMercado), o, () => true).sort((a, b) => Number(b.real_segun_guia) - Number(a.real_segun_guia) || b.rating - a.rating);
  const cards: Card[] = [...ps.slice(0, 1).map((p) => ({ tipo: "puesto" as const, id: p.id })), ...ms.slice(0, 3 - Math.min(1, ps.length)).map((m) => ({ tipo: "mercado" as const, id: m.id }))];
  if (!cards.length) return ayuda(o);
  const partes = [
    ...ps.slice(0, 1).map((p) => `${p.nombre} (${p.ubicacion_texto}, ★${p.rating})`),
    ...ms.slice(0, 2).map((m) => `${m.nombre_display} (${estadoTexto(m, o)}, ${dist(o, m)})`),
  ];
  return {
    intencion: "comida",
    text: en
      ? `For ${plat.clave}, my picks${distanciasDesde(o)}: ${lista(partes, "en")}. ¡Buen provecho! (Enjoy your meal!)`
      : `¡Para ${plat.clave}, pásele a ${lista(partes, "es")}! Distancias${desde(o) || " desde donde estás"}. ¡Buen provecho!`,
    cards,
  };
}

function abiertoAhora(msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const t = normalizar(msg);
  const en = o.locale === "en";
  const pide24 = tiene(t, /24 ?h|24 horas|24 hours|all night|madrugada/);
  const candidatos = d.mercados.filter((m) => {
    const e = estadoHorario(m.horario, o.now);
    return pide24 ? e.estado === "abierto" && e.es24h : e.estado === "abierto";
  });
  const ms = ordenar(candidatos, o, () => true).slice(0, 3);
  if (!ms.length) {
    const prox = ordenar(d.mercados.filter((m) => m.horario), o, () => true).slice(0, 3);
    return {
      intencion: "abierto",
      text: en
        ? `Right now no market with published hours is open. Closest ones: ${lista(prox.map((m) => `${m.nombre_display} (${estadoTexto(m, o)})`), "en")}.`
        : `Ahorita no hay mercados con horario publicado abiertos. Los más cercanos: ${lista(prox.map((m) => `${m.nombre_display} (${estadoTexto(m, o)})`), "es")}.`,
      cards: prox.map((m) => ({ tipo: "mercado", id: m.id })),
    };
  }
  const partes = ms.map((m) => `${m.nombre_display} (${estadoTexto(m, o)}, ${dist(o, m)})`);
  return {
    intencion: "abierto",
    text: pide24
      ? en
        ? `Open 24 hours: ${lista(partes, "en")}.`
        : `Abiertos las 24 horas: ${lista(partes, "es")}.`
      : en
        ? `Open right now${distanciasDesde(o)}: ${lista(partes, "en")}. Only markets with published hours are included.`
        : `Abiertos ahorita${distanciasDesde(o)}: ${lista(partes, "es")}. Solo cuento mercados con horario publicado.`,
    cards: ms.map((m) => ({ tipo: "mercado", id: m.id })),
  };
}

function llegar(msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const en = o.locale === "en";
  const q = tokenizar(msg).filter((w) => !/^(como|llego|llegar|llevame|donde|esta|queda|how|do|i|get|to|take|me|where|is|directions|con|al|a|puesto|stall|market)$/.test(w));
  const score = (texto: string) => {
    const toks = tokenizar(texto);
    return q.reduce((s, w) => s + (toks.some((tk) => tk === w || (w.length >= 4 && (tk.startsWith(w) || levenshtein(w, tk, 1) <= 1))) ? 1 : 0), 0);
  };
  const puesto = [...d.puestos].map((p) => ({ p, s: score(p.nombre) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || Number(b.p.real_segun_guia) - Number(a.p.real_segun_guia))[0]?.p;
  if (puesto) {
    const m = mercadoDe(d, puesto.mercadoId)!;
    return {
      intencion: "llegar",
      text: en
        ? `${puesto.nombre} is at ${m.nombre_display}: ${puesto.ubicacion_texto}. Tap “Take me there” for step-by-step directions from Metro Merced.`
        : `${puesto.nombre} está en ${/^Mercado\b/.test(m.nombre_display) ? "el " : ""}${m.nombre_display}: ${puesto.ubicacion_texto}. Toca «Llévame» y te guío paso a paso desde el Metro Merced.`,
      cards: [{ tipo: "puesto", id: puesto.id }],
    };
  }
  const mercado = [...d.mercados].map((m) => ({ m, s: score(m.nombre_display) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || Number(b.m.destacado) - Number(a.m.destacado))[0]?.m;
  if (mercado) {
    return {
      intencion: "llegar",
      text: en
        ? `${mercado.nombre_display} is at ${mercado.direccion} (${dist(o, mercado)}${desde(o)}). “Directions” opens Google Maps with public transit.`
        : `${mercado.nombre_display} está en ${mercado.direccion} (${dist(o, mercado)}${desde(o)}). «Cómo llegar» abre Google Maps en transporte público.`,
      cards: [{ tipo: "mercado", id: mercado.id }],
    };
  }
  return ayuda(o);
}

const CULTIVO: { re: RegExp; buscar: RegExp; es: string; en: string }[] = [
  { re: /nopal|xoconostle/, buscar: /nopal/, es: "nopal", en: "nopal" },
  { re: /amarant|alegria/, buscar: /amaranto|alegria/, es: "amaranto", en: "amaranth" },
  { re: /chinampa|verdura|hortaliza|lechuga|greens|vegetable|verdolaga/, buscar: /hortaliza|lechuga|verdolaga|acelga|brocoli|romerito/, es: "verdura de chinampa", en: "chinampa greens" },
  { re: /maiz|corn/, buscar: /maiz/, es: "maíz nativo", en: "native corn" },
  { re: /mole/, buscar: /mole/, es: "mole", en: "mole" },
  { re: /hongo|mushroom/, buscar: /hongo/, es: "hongos", en: "mushrooms" },
];

function productor(msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const t = normalizar(msg);
  const en = o.locale === "en";
  const c = CULTIVO.find((x) => x.re.test(t));
  const ps = d.productores
    .filter((p) => !c || c.buscar.test(normalizar([p.producto_principal, ...p.catalogo].join(" "))))
    .sort((a, b) => b.comercio_justo.mejora_pct - a.comercio_justo.mejora_pct || b.rating - a.rating)
    .slice(0, 3);
  const partes = ps.map((p) => `${p.nombre} (${p.pueblo}, ${formatMXN(p.precio_mayoreo_app.precio, o.locale)}/${unidad(p.precio_mayoreo_app.unidad, o)})`);
  return {
    intencion: "productor",
    text: en
      ? `Buy ${c ? c.en : "produce"} straight from the growers: ${lista(partes, "en")}. Farm purchases earn double points.`
      : `Compra ${c ? c.es : "directo del campo"} a quien lo cultiva: ${lista(partes, "es")}. Comprar al huerto da puntos dobles.`,
    cards: ps.map((p) => ({ tipo: "productor", id: p.id })),
  };
}

function eventos(_msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const en = o.locale === "en";
  const now = o.now ?? new Date();
  const limite = new Date(now.getTime() + 30 * 86_400_000).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  const hoy = hoyCDMX(now);
  const vig = eventosVigentes(d.eventos, now).filter((e) => e.inicio !== "recurrente" && e.inicio <= limite && (e.fin ?? e.inicio) >= hoy).slice(0, 3);
  const evs = vig.length ? vig : eventosVigentes(d.eventos, now).slice(0, 3);
  const etiqueta = (e: (typeof evs)[number]) => {
    const et = etiquetaEvento(e, now);
    return et === "en curso" ? (en ? "happening now" : "en curso") : et === "por confirmar" ? (en ? "date TBC" : "fecha por confirmar") : "";
  };
  const partes = evs.map((e) => `${enIdioma(e, "titulo", o.locale)} (${e.inicio === "recurrente" ? (en ? "always on" : "siempre") : formatRangoFechas(e.inicio, e.fin, o.locale)}${etiqueta(e) ? `, ${etiqueta(e)}` : ""})`);
  return {
    intencion: "eventos",
    text: en ? `Coming up in the next 30 days: ${lista(partes, "en")}. Tap “Remind me” so you don't miss them.` : `En los próximos 30 días: ${lista(partes, "es")}. Toca «Recordarme» para no perdértelos.`,
    cards: evs.map((e) => ({ tipo: "evento", id: e.id })),
  };
}

function artesanias(msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const t = normalizar(msg);
  const en = o.locale === "en";
  const especifico = ["talavera", "alebrije", "plata", "silver", "textil", "bordad"].find((w) => t.includes(w));
  const buscar = especifico === "silver" ? "plata" : especifico;
  const texto = (m: Mercado) => normalizar([...(m.imperdibles ?? []), m.resumen ?? "", m.resumen_en ?? "", ...m.giros].join(" "));
  let ms = d.mercados.filter((m) => m.giros.includes("artesanías") && (!buscar || texto(m).includes(buscar)));
  if (!ms.length) ms = d.mercados.filter((m) => m.giros.includes("artesanías"));
  ms = ordenar(ms, o, (m) => estadoHorario(m.horario, o.now).estado === "abierto").slice(0, 3);
  const partes = ms.map((m) => `${m.nombre_display} (${estadoTexto(m, o)}, ${dist(o, m)})`);
  return {
    intencion: "artesanias",
    text: en ? `For crafts${especifico ? ` like ${especifico}` : ""}: ${lista(partes, "en")}.` : `Para artesanías${especifico ? ` como ${especifico}` : ""}: ${lista(partes, "es")}.`,
    cards: ms.map((m) => ({ tipo: "mercado", id: m.id })),
  };
}

function comercioJusto(_msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const en = o.locale === "en";
  // Ejemplo del guion (Familia Jurado Nopaleros); si no está, el de mayor mejora.
  const p = d.productores.find((x) => x.id === "prod-milpa-01") ?? [...d.productores].sort((a, b) => b.comercio_justo.mejora_pct - a.comercio_justo.mejora_pct)[0];
  const f = precioJusto(p);
  const $ = (n: number) => formatMXN(n, o.locale);
  return {
    intencion: "comercioJusto",
    text: en
      ? `In Bara Bara you buy closer to the field, with fewer middlemen. Example: of every ${$(f.precio)} you pay per ${unidad(f.unidad, o)} of ${p.producto_principal.toLowerCase()}, ${p.nombre} now keeps ${$(f.recibe)} (${f.pctApp}%) instead of ${$(f.antes)} (${f.pctIntermediarios}%). QR payments carry no fee.`
      : `En Bara Bara compras más cerca del campo y con menos intermediarios. Ejemplo: de cada ${$(f.precio)} del ${f.unidad} de ${p.producto_principal.toLowerCase()}, ${p.nombre} ahora recibe ${$(f.recibe)} (${f.pctApp}%) en vez de ${$(f.antes)} (${f.pctIntermediarios}%). El cobro con QR no tiene comisión.`,
    cards: [{ tipo: "productor", id: p.id }],
  };
}

function puntos(_msg: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const en = o.locale === "en";
  const ruta = d.rutas.find((r) => r.tipo === "gratis") ?? d.rutas[0];
  return {
    intencion: "puntos",
    text: en
      ? `Your Market Passport earns points even if you pay in cash: scan the stall's QR for +10 (once per stall per day); your first check-in at a new market adds +50 and a stamp. Paying in the app gives 1 point per $10. Try a route to collect stamps!`
      : `Tu Pasaporte suma aunque pagues en efectivo: escanea el QR del puesto y ganas +10 (1 vez por puesto al día); tu primer check-in en un mercado nuevo da +50 y un sello. Si pagas en la app, 1 punto por cada $10. ¡Sigue una ruta y junta sellos!`,
    cards: ruta ? [{ tipo: "ruta", id: ruta.id }] : [],
  };
}

function ayuda(o: Opciones): ResultadoIntencion {
  return {
    intencion: "ayuda",
    text:
      o.locale === "en"
        ? "I can help you find food (pancita, huaraches, carnitas…), markets open now, directions to a stall, growers to buy from directly, this month's events, crafts, and how points work. What are you craving?"
        : "Te ayudo a encontrar comida (pancita, huaraches, carnitas…), mercados abiertos, cómo llegar a un puesto, productores para comprar directo, eventos del mes, artesanías y cómo funcionan los puntos. ¿Qué se le antoja?",
    cards: [],
  };
}

/** Responde por reglas. Siempre devuelve cards con ids existentes (máx. 3). */
export function responderSinIA(mensaje: string, d: DatosAsistente, o: Opciones): ResultadoIntencion {
  const intencion = detectarIntencion(mensaje);
  const r =
    intencion === "comida"
      ? comida(mensaje, d, o)
      : intencion === "abierto"
        ? abiertoAhora(mensaje, d, o)
        : intencion === "llegar"
          ? llegar(mensaje, d, o)
          : intencion === "productor"
            ? productor(mensaje, d, o)
            : intencion === "eventos"
              ? eventos(mensaje, d, o)
              : intencion === "artesanias"
                ? artesanias(mensaje, d, o)
                : intencion === "comercioJusto"
                  ? comercioJusto(mensaje, d, o)
                  : intencion === "puntos"
                    ? puntos(mensaje, d, o)
                    : ayuda(o);
  return { ...r, cards: r.cards.slice(0, 3) };
}
