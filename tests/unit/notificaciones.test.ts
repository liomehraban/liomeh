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
