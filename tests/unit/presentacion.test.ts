import { describe, expect, it } from "vitest";

import interior from "../../data/la_merced_interior.json";
import eventos from "../../data/eventos.json";
import huertos from "../../data/huertos.json";
import { EVENTO_DEMO, PASOS, PRODUCTOR_FAIRTRADE, PUESTO_CHECKIN, PUESTO_DEMO, RUTA_DEMO, progreso } from "@/lib/presentacion";

const lista = <T,>(x: unknown, k: string) => (Array.isArray(x) ? x : (x as Record<string, T[]>)[k]) as T[];

describe("presentación", () => {
  it("tiene los 10 pasos de 06_demo.md en orden de perfil", () => {
    expect(PASOS).toHaveLength(10);
    expect(PASOS.map((p) => p.perfil)).toEqual([...Array(7).fill("consumidor"), "locatario", "productor", "gobierno"]);
    expect(PASOS.slice(0, 4).every((p) => p.locale === "en")).toBe(true);
    expect(PASOS.slice(4).every((p) => p.locale === "es")).toBe(true);
  });

  it("cada cambio de perfil empieza navegando", () => {
    PASOS.forEach((p, i) => {
      if (i === 0 || PASOS[i - 1].perfil !== p.perfil || PASOS[i - 1].locale !== p.locale) expect(p.acciones[0].tipo).toBe("ir");
    });
  });

  it("los ids del guion existen en /data", () => {
    const puestos = (interior as { puestos: { id: string; productos: { n: string }[] }[] }).puestos;
    const chela = puestos.find((p) => p.id === PUESTO_DEMO)!;
    expect(chela).toBeTruthy();
    expect(puestos.some((p) => p.id === PUESTO_CHECKIN)).toBe(true);
    expect((interior as { rutas_precalculadas: Record<string, unknown> | { id: string }[] }).rutas_precalculadas).toBeTruthy();
    expect(JSON.stringify(interior)).toContain(RUTA_DEMO);
    expect(lista<{ id: string }>(eventos, "eventos").some((e) => e.id === EVENTO_DEMO)).toBe(true);
    expect(lista<{ id: string }>(huertos, "productores").some((p) => p.id === PRODUCTOR_FAIRTRADE)).toBe(true);
    // los productos que se agregan en el paso 4 son los del catálogo real
    const dentro = PASOS[3].acciones.flatMap((a) => ("dentro" in a && a.dentro ? [a.dentro.replace("producto:", "")] : []));
    for (const n of dentro) expect(chela.productos.some((p) => p.n === n)).toBe(true);
  });

  it("progreso va de 1/10 a 10/10", () => {
    expect(progreso(0)).toBeCloseTo(0.1);
    expect(progreso(9)).toBe(1);
    expect(progreso(-1)).toBe(0);
  });
});
