import { describe, expect, it } from "vitest";


describe("vigencia de planes", () => {
  it("el Pase Turista vence a los 7 días y Mercado+ a los 30", async () => {
    const { venceEn, planVencido } = await import("@/lib/planes");
    const now = new Date("2026-10-01T12:00:00Z");
    const pase = venceEn("Pase Turista", now)!;
    expect(pase).toBe("2026-10-08T12:00:00.000Z");
    expect(venceEn("Mercado+", now)).toBe("2026-10-31T12:00:00.000Z");
    expect(venceEn("Gratis", now)).toBeNull();
    expect(planVencido("Pase Turista", pase, new Date("2026-10-08T11:59:00Z"))).toBe(false);
    expect(planVencido("Pase Turista", pase, new Date("2026-10-08T12:00:00Z"))).toBe(true);
    expect(planVencido("Gratis", null, now)).toBe(false);
  });

  it("los beneficios en inglés tienen el mismo número que los de modelo_negocio", async () => {
    const mn = (await import("../../data/modelo_negocio.json")).default as { precios: Record<string, { incluye: string[] }[]> };
    const en = (await import("../../messages/en.json")).default as unknown as { planes: { beneficiosEn: Record<string, string[]> }; locatario: { plan: { beneficiosEn: Record<string, string[]> } } };
    expect([en.planes.beneficiosEn.gratis, en.planes.beneficiosEn.pase, en.planes.beneficiosEn.mercadoMas].map((x) => x.length)).toEqual(mn.precios.consumidor.map((p) => p.incluye.length));
    expect([en.locatario.plan.beneficiosEn.Gratis, en.locatario.plan.beneficiosEn.Pro, en.locatario.plan.beneficiosEn.Plus].map((x) => x.length)).toEqual(mn.precios.locatario.map((p) => p.incluye.length));
  });
});
