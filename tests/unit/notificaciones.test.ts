import { describe, expect, it } from "vitest";

import { haceTiempo, avisosDePedidos, bandejaInicial, pedidoLocatarioSimulado, pedidoMayoreoSimulado, siguienteAviso, type DatosAvisos, type EstadoAvisos } from "@/lib/notificaciones";

const a = (hhmm: string) => new Date(`2026-10-01T${hhmm}:00-06:00`);
const datos: DatosAvisos = {
  eventos: [{ id: "mole-2026", titulo: "49ª Feria Nacional del Mole", inicio: "2026-10-03", fin: "2026-10-25" }],
  ofertas: [{ id: "r1", producto: "Jitomate", mercadoNombre: "Jamaica", precio: 17, precioOriginal: 28, unidad: "kg" }],
  surtidos: [{ puestoId: "x--1", puesto: "Frutas Doña Mary", mercado: "Mercado X", producto: "Aguacate hass" }],
  puestoDemo: { id: "pancita-dona-chela", nombre: "Pancita Doña Chela", productos: [{ n: "Pancita (pata, libro y cuaderno)", p: 115, u: "plato" }, { n: "Sope", p: 35, u: "pieza" }] },
  productor: { nombre: "Chinampa", catalogo: ["Lechuga orejona (pieza)", "Verdolaga (kg)"] },
  impacto: { transaccionesDia: 19600, checkinsDia: 11700, kgRescatadosDia: 1230 },
};
const vacio: EstadoAvisos = { pedidos: [], recordatorios: [], lotes: [], entregados: [] };

describe("notificaciones simuladas", () => {
  it("avisa cada cambio de etapa del pedido una sola vez", () => {
    const pedido = { folio: "BB-AB12", fecha: a("10:00").toISOString(), entrega: "recoger" as const };
    const t = new Date(a("10:00").getTime() + 17_000);
    const primeros = avisosDePedidos([pedido], t, []);
    expect(primeros.map((x) => x.id)).toEqual(["pedido:BB-AB12:listo"]);
    expect(avisosDePedidos([pedido], t, ["pedido:BB-AB12:listo"])).toEqual([]);
  });

  it("consumidor con recordatorio: avisa el evento próximo", () => {
    const r = siguienteAviso("consumidor", { ...datos, ofertas: [], surtidos: [] }, { ...vacio, recordatorios: ["mole-2026"], entregados: ["checkin:2026-10-01"] }, a("09:00"), 7);
    expect(r?.aviso).toMatchObject({ clave: "eventoPronto", params: { dias: 2 }, href: "/agenda" });
  });

  it("no repite avisos ya entregados y devuelve null cuando no queda nada", () => {
    const e = { ...vacio, entregados: [] as string[] };
    const vistos = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const r = siguienteAviso("consumidor", datos, e, a("12:30"), i);
      if (!r) break;
      expect(vistos.has(r.aviso.id)).toBe(false);
      vistos.add(r.aviso.id);
      e.entregados.push(r.aviso.id);
    }
    expect(siguienteAviso("consumidor", datos, e, a("12:30"), 99)).toBeNull();
  });

  it("locatario: los pedidos nuevos llegan con efecto y usan productos del puesto", () => {
    const p = pedidoLocatarioSimulado(datos.puestoDemo.productos, 3, a("11:00"));
    expect(p.estado).toBe("nuevo");
    expect(p.total).toBeGreaterThan(0);
    expect(p.items).toMatch(/pancita|sope/);
    let conEfecto = false;
    for (let s = 0; s < 10; s++) conEfecto ||= siguienteAviso("locatario", datos, vacio, a("11:00"), s)?.efecto?.tipo === "pedidoLocatario";
    expect(conEfecto).toBe(true);
    expect(siguienteAviso("locatario", datos, vacio, a("23:00"), 1)).not.toBeNull();
  });

  it("productor: pedido de mayoreo de su catálogo", () => {
    const p = pedidoMayoreoSimulado(datos.productor.catalogo, 5);
    expect(["Lechuga orejona", "Verdolaga"]).toContain(p.producto);
    expect(p.estadoId).toBe("nuevo");
  });

  it("gobierno: cifras de impacto crecen durante el día", () => {
    const m = siguienteAviso("gobierno", datos, vacio, a("09:00"), 1)!.aviso.params;
    const t = siguienteAviso("gobierno", datos, vacio, a("17:00"), 1)!.aviso.params;
    expect(Number(Object.values(t)[0])).toBeGreaterThan(Number(Object.values(m)[0]));
  });

  it("bandeja inicial con bienvenida", () => {
    expect(bandejaInicial("productor", datos, a("10:00")).map((x) => x.clave)).toContain("bienvenida_productor");
  });

  it("hace cuánto, para marcas de tiempo", () => {
    const now = a("12:00");
    expect(haceTiempo(now.toISOString(), now)).toBe("hace un momento");
    expect(haceTiempo(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe("hace 5 minutos");
    expect(haceTiempo(new Date(now.getTime() - 2 * 3600_000).toISOString(), now, "en")).toBe("2 hours ago");
  });
});

describe("folios simulados", () => {
  it("siguen la numeración y no repiten ninguno existente", async () => {
    const { siguienteFolio, pedidoLocatarioSimulado } = await import("@/lib/notificaciones");
    expect(siguienteFolio("PED", ["PED-4821", "PED-4822"], 4830)).toBe("PED-4830");
    expect(siguienteFolio("PED", ["PED-4830", "PED-4899", "BB-AB12"], 4830)).toBe("PED-4900");
    const p = pedidoLocatarioSimulado([{ n: "Sope", p: 35, u: "pieza" }], 1, new Date("2026-10-01T12:00:00-06:00"), ["PED-4830"]);
    expect(p.folio).toBe("PED-4831");
    expect(p.fecha).toBe("2026-10-01T18:00:00.000Z");
  });
});

describe("avisos por perfil", () => {
  it("cada aviso lleva el perfil al que va dirigido", async () => {
    const { siguienteAviso, bandejaInicial, avisosDePedidos } = await import("@/lib/notificaciones");
    const d = {
      eventos: [],
      ofertas: [],
      surtidos: [],
      puestoDemo: { id: "p", nombre: "P", productos: [{ n: "Sope", p: 35, u: "pieza" }] },
      productor: { nombre: "C", catalogo: ["Lechuga (pieza)"] },
      impacto: { transaccionesDia: 1000, checkinsDia: 500, kgRescatadosDia: 100 },
    };
    const e = { pedidos: [], recordatorios: [], lotes: [], entregados: [] };
    expect(siguienteAviso("locatario", d, e, new Date(), 1)?.aviso.perfil).toBe("locatario");
    expect(siguienteAviso("gobierno", d, e, new Date(), 1)?.aviso.perfil).toBe("gobierno");
    expect(bandejaInicial("productor", d, new Date()).every((a) => a.perfil === "productor")).toBe(true);
    const ahora = new Date();
    const p = { folio: "BB-1", fecha: new Date(ahora.getTime() - 20_000).toISOString(), entrega: "recoger" as const };
    expect(avisosDePedidos([p], ahora, [])[0].perfil).toBe("consumidor");
  });
});
