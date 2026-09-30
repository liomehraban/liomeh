import { describe, expect, it } from "vitest";

import metricasJson from "../../data/metricas_gobierno.json";
import { MetricasGobierno } from "@/lib/schemas";
import {
  RAMPA_ADOPCION,
  adopcion,
  alcaldiasPorVentas,
  claveAlcaldia,
  colorAdopcion,
  csvMetricas,
  mapaAdopcion,
  pasoAdopcion,
  toneladasRescatadas,
} from "@/lib/gobierno";

const m = MetricasGobierno.parse(metricasJson);

describe("gobierno", () => {
  it("adopción = activos / mercados de la alcaldía", () => {
    expect(adopcion({ mercados: 42, mercados_activos_en_app: 27 })).toBeCloseTo(27 / 42);
    expect(adopcion({ mercados: 0, mercados_activos_en_app: 0 })).toBe(0);
  });

  it("la rampa es secuencial y los cortes asignan pasos en orden", () => {
    expect(pasoAdopcion(0)).toBe(0);
    expect(pasoAdopcion(0.2)).toBe(1);
    expect(pasoAdopcion(0.49)).toBe(2);
    expect(pasoAdopcion(0.5)).toBe(3);
    expect(pasoAdopcion(0.9)).toBe(4);
    expect(colorAdopcion(0.9)).toBe(RAMPA_ADOPCION[4]);
  });

  it("cruza alcaldías sin importar acentos ni mayúsculas", () => {
    const mapa = mapaAdopcion(m.por_alcaldia);
    expect(claveAlcaldia("CUAUHTÉMOC")).toBe("cuauhtemoc");
    expect(mapa.get(claveAlcaldia("Venustiano Carranza"))).toBeCloseTo(27 / 42);
    expect(mapa.size).toBe(16);
  });

  it("los totales por alcaldía cuadran con los KPIs del JSON", () => {
    const activos = m.por_alcaldia.reduce((s, a) => s + a.mercados_activos_en_app, 0);
    expect(activos).toBe(m.kpis_hoy.mercados_en_app);
    expect(alcaldiasPorVentas(m.por_alcaldia)[0].alcaldia).toBe("Venustiano Carranza");
  });

  it("SEDEMA suma los kg rescatados en la demo", () => {
    expect(toneladasRescatadas(37, 0)).toBe(37);
    expect(toneladasRescatadas(37, 12)).toBe(37.012);
  });

  it("CSV con las cuatro tablas, BOM y comillas escapadas", () => {
    const csv = csvMetricas(m, { "la-merced": "La Merced, Nave Mayor" });
    expect(csv.startsWith("﻿")).toBe(true);
    const bloques = csv.trim().split("\n\n");
    expect(bloques).toHaveLength(4);
    expect(bloques[1].split("\n")).toHaveLength(m.por_alcaldia.length + 1);
    expect(bloques[2].split("\n")).toHaveLength(m.serie_mensual.length + 1);
    expect(csv).toContain('la-merced,"La Merced, Nave Mayor",212000');
    expect(csv).toContain("derrama_digital_mes_mxn,70611000");
  });

  it("el CSV coincide con la pantalla: el alimento rescatado suma los kg de la demo", () => {
    const csv = csvMetricas(m, {}, 12);
    expect(csv).toContain(`alimento_rescatado_mes_ton,${toneladasRescatadas(m.kpis_hoy.alimento_rescatado_mes_ton, 12)}`);
    expect(csv).toContain("# demo");
    expect(csvMetricas(m)).not.toContain("# demo");
  });
});
