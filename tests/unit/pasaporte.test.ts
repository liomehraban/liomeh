import { describe, it, expect } from "vitest";
import mercados from "../../data/mercados.json";
import huertos from "../../data/huertos.json";
import { esCentroHistorico, evaluarCheckin, evaluarInsignias, nuevoCupon, type Checkin, type ContextoInsignias } from "../../src/lib/loyalty";
import { accesoRutaPremium, limiteAsistente, planDesdeModelo } from "../../src/lib/planes";

const ctx: ContextoInsignias = {
  mercados: Object.fromEntries(mercados.map((m) => [m.id, { alcaldia: m.alcaldia, colonia: m.colonia, lat: m.lat, lng: m.lng }])),
  productores: Object.fromEntries(huertos.productores.map((p) => [p.id, { alcaldia: p.alcaldia }])),
};
const t = (iso: string) => new Date(iso);
const ci = (objetivo: string, mercadoId: string, fecha = "2026-10-01T18:00:00Z"): Checkin => ({ objetivo, mercadoId, fecha });

describe("check-in", () => {
  const base = { checkins: [] as Checkin[], sellos: ["la-merced"] };
  it("+10 en un mercado con sello (paso 7: Jugos Moreno)", () => {
    const r = evaluarCheckin(base, "jugos-moreno", "la-merced", t("2026-10-01T18:00:00Z"));
    expect(r).toMatchObject({ ok: true, puntos: 10, selloNuevo: false });
  });
  it("primer check-in en un mercado nuevo: +60 y sello", () =>
    expect(evaluarCheckin(base, "mercado:53-rio-blanco", "53-rio-blanco")).toMatchObject({ ok: true, puntos: 60, selloNuevo: true }));
  it("segundo check-in el mismo día en el mismo puesto: «yaHoy»", () => {
    const r = evaluarCheckin({ ...base, checkins: [ci("jugos-moreno", "la-merced", "2026-10-01T14:00:00Z")] }, "jugos-moreno", "la-merced", t("2026-10-01T23:00:00Z"));
    expect(r).toEqual({ ok: false, motivo: "yaHoy" });
  });
  it("al día siguiente (CDMX) sí vuelve a sumar", () => {
    // 23:00 UTC del 1 = 17:00 CDMX del 1; 07:00 UTC del 2 = 01:00 CDMX del 2
    const r = evaluarCheckin({ ...base, checkins: [ci("jugos-moreno", "la-merced", "2026-10-01T23:00:00Z")] }, "jugos-moreno", "la-merced", t("2026-10-02T07:00:00Z"));
    expect(r.ok).toBe(true);
  });
  it("otro puesto el mismo día sí suma", () =>
    expect(evaluarCheckin({ ...base, checkins: [ci("jugos-moreno", "la-merced")] }, "dona-tere", "la-merced", t("2026-10-01T19:00:00Z")).ok).toBe(true));
});

describe("insignias", () => {
  const vacio = { sellos: [], checkins: [], huertosComprados: [] };
  it("«Antojo chilango»: Río Blanco + pancita en La Merced + Jamaica Comidas", () => {
    const dos = { ...vacio, checkins: [ci("mercado:53-rio-blanco", "53-rio-blanco"), ci("pancita-dona-chela", "la-merced")] };
    expect(evaluarInsignias(dos, ctx)).not.toContain("antojo");
    const tres = { ...dos, checkins: [...dos.checkins, ci("mercado:65-jamaica-comidas", "65-jamaica-comidas")] };
    expect(evaluarInsignias(tres, ctx)).toContain("antojo");
  });
  it("pancita: el check-in en otro puesto de La Merced no cuenta", () => {
    const e = { ...vacio, checkins: [ci("mercado:53-rio-blanco", "53-rio-blanco"), ci("dona-tere", "la-merced"), ci("mercado:65-jamaica-comidas", "65-jamaica-comidas")] };
    expect(evaluarInsignias(e, ctx)).not.toContain("antojo");
  });
  it("«Corazón del Centro»: 5 mercados del Centro Histórico", () => {
    const centro = ["la-merced", "16-abelardo-l-rodriguez-zona", "86-san-juan-curiosidades", "77-san-juan-ernesto-pugibet", "la-ciudadela"];
    expect(centro.every((id) => esCentroHistorico(ctx.mercados[id]))).toBe(true);
    expect(esCentroHistorico(ctx.mercados["53-rio-blanco"])).toBe(false);
    expect(evaluarInsignias({ ...vacio, sellos: centro }, ctx)).toContain("centro");
    expect(evaluarInsignias({ ...vacio, sellos: centro.slice(0, 4) }, ctx)).not.toContain("centro");
  });
  it("«Chinampero»: 2 huertos de Xochimilco o Tláhuac", () => {
    expect(evaluarInsignias({ ...vacio, huertosComprados: ["prod-xochi-01", "prod-tlah-01"] }, ctx)).toContain("chinampero");
    expect(evaluarInsignias({ ...vacio, huertosComprados: ["prod-xochi-01", "prod-milpa-01"] }, ctx)).not.toContain("chinampero");
  });
  it("«Madrugador»: CEDA antes de las 7:00 CDMX", () => {
    expect(evaluarInsignias({ ...vacio, checkins: [ci("mercado:central-de-abasto", "central-de-abasto", "2026-10-01T12:30:00Z")] }, ctx)).toContain("madrugador"); // 06:30
    expect(evaluarInsignias({ ...vacio, checkins: [ci("mercado:central-de-abasto", "central-de-abasto", "2026-10-01T13:30:00Z")] }, ctx)).not.toContain("madrugador"); // 07:30
  });
  it("«Las 16 alcaldías»", () => {
    const una = [...new Map(mercados.map((m) => [m.alcaldia, m.id])).values()];
    expect(una).toHaveLength(16);
    expect(evaluarInsignias({ ...vacio, sellos: una }, ctx)).toContain("16");
    expect(evaluarInsignias({ ...vacio, sellos: una.slice(1) }, ctx)).not.toContain("16");
  });
});

describe("recompensas y planes", () => {
  it("cupón con código", () => expect(nuevoCupon({ id: "agua", titulo: "Agua", puntos: 120 }, () => 0.5).codigo).toBe("PSL-AGUA-550000"));
  it("límite del asistente por plan", () => {
    expect(limiteAsistente("Gratis")).toBe(20);
    expect(limiteAsistente("Pase Turista")).toBe(Infinity);
    expect(limiteAsistente("Mercado+")).toBe(Infinity);
  });
  it("rutas premium solo con Pase Turista", () => {
    expect(accesoRutaPremium("Pase Turista")).toBe(true);
    expect(accesoRutaPremium("Mercado+")).toBe(false);
  });
  it("planDesdeModelo", () => {
    expect(planDesdeModelo("Pase Turista 7 días")).toBe("Pase Turista");
    expect(planDesdeModelo("Mercado+ (residentes)")).toBe("Mercado+");
    expect(planDesdeModelo("Gratis")).toBe("Gratis");
  });
});

import { consumirPregunta, preguntasRestantes } from "../../src/lib/planes";
describe("límite del asistente", () => {
  const now = new Date("2026-10-01T18:00:00Z");
  it("20 al día en Gratis; la 21 se bloquea", () => {
    let c = { fecha: "", usados: 0 };
    for (let i = 0; i < 20; i++) {
      const r = consumirPregunta(c, "Gratis", now);
      expect(r.ok).toBe(true);
      c = r.contador;
    }
    expect(consumirPregunta(c, "Gratis", now).ok).toBe(false);
    expect(preguntasRestantes(c, "Gratis", now)).toBe(0);
  });
  it("se reinicia al día siguiente (CDMX) y es ilimitado con plan de pago", () => {
    const lleno = { fecha: "2026-10-01", usados: 20 };
    expect(consumirPregunta(lleno, "Gratis", new Date("2026-10-02T15:00:00Z")).ok).toBe(true);
    expect(consumirPregunta(lleno, "Pase Turista", now)).toMatchObject({ ok: true, restantes: Infinity });
  });
});
