import { formatRangoFechas } from "../eventos";
import type { Card, DatosAsistente, Locale, TarjetaResuelta } from "./types";

/** true si la tarjeta apunta a un registro que existe en los datos. */
export function cardValida(c: Card, d: DatosAsistente): boolean {
  switch (c.tipo) {
    case "mercado":
      return d.mercados.some((m) => m.id === c.id);
    case "puesto":
      return d.puestos.some((p) => p.id === c.id);
    case "productor":
      return d.productores.some((p) => p.id === c.id);
    case "evento":
      return d.eventos.some((e) => e.id === c.id);
    case "ruta":
      return d.rutas.some((r) => r.id === c.id);
  }
}

/** Completa las tarjetas con lo necesario para pintarlas y sus acciones. */
export function resolverTarjetas(cards: Card[], d: DatosAsistente, locale: Locale): TarjetaResuelta[] {
  const out: TarjetaResuelta[] = [];
  for (const c of cards) {
    if (c.tipo === "mercado") {
      const m = d.mercados.find((x) => x.id === c.id);
      if (m) out.push({ ...c, titulo: m.nombre_display, subtitulo: (locale === "en" ? (m.lema_en ?? m.lema) : m.lema) ?? m.alcaldia, lat: m.lat, lng: m.lng });
    } else if (c.tipo === "puesto") {
      const p = d.puestos.find((x) => x.id === c.id);
      if (p) out.push({ ...c, titulo: p.nombre, subtitulo: p.ubicacion_texto, mercadoId: p.mercadoId });
    } else if (c.tipo === "productor") {
      const p = d.productores.find((x) => x.id === c.id);
      if (p) out.push({ ...c, titulo: p.nombre, subtitulo: `${p.producto_principal} · ${p.pueblo}, ${p.alcaldia}`, lat: p.lat, lng: p.lng });
    } else if (c.tipo === "evento") {
      const e = d.eventos.find((x) => x.id === c.id);
      if (e) out.push({ ...c, titulo: e.titulo, subtitulo: `${e.inicio === "recurrente" ? "" : `${formatRangoFechas(e.inicio, e.fin, locale)} · `}${e.lugar}`, lat: e.lat, lng: e.lng });
    } else {
      const r = d.rutas.find((x) => x.id === c.id);
      if (r) out.push({ ...c, titulo: r.titulo, subtitulo: `${r.duracion_h} h · ${r.km} km` });
    }
  }
  return out;
}
