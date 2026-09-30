import { describe, it, expect } from "vitest";

import en from "../../messages/en.json";
import { datosMock } from "@/data/mock-repository";
import { enIdioma, traducirCantidades, traducirValor } from "@/lib/idioma";

describe("enIdioma", () => {
  const r = { titulo: "Ciudad de flores", titulo_en: "City of flowers", incluye: "Degustación", incluye_en: "" };
  it("en `en` usa el campo *_en", () => expect(enIdioma(r, "titulo", "en")).toBe("City of flowers"));
  it("en `es` usa el original", () => expect(enIdioma(r, "titulo", "es")).toBe("Ciudad de flores"));
  it("sin versión en inglés (o vacía) cae al español", () => {
    expect(enIdioma(r, "incluye", "en")).toBe("Degustación");
    expect(enIdioma({ nombre: "Chinampero" }, "nombre", "en")).toBe("Chinampero");
  });
});

describe("traducirValor / traducirCantidades", () => {
  const unidades = en.datos.unidades as Record<string, string>;
  it("traduce lo que está en el diccionario y deja igual lo demás", () => {
    expect(traducirValor(unidades, "pieza")).toBe("piece");
    expect(traducirValor(unidades, "500 ml")).toBe("500 ml");
  });
  it("traduce solo la unidad de cada cantidad", () => {
    expect(traducirCantidades("80 piezas, 2 ciento", (u) => traducirValor(unidades, u))).toBe("80 pieces, 2 100 pcs");
    expect(traducirCantidades("15 kg", (u) => traducirValor(unidades, u))).toBe("15 kg");
  });
});

describe("cobertura en inglés de /data", () => {
  const d = datosMock();
  const falta = (dic: Record<string, string>, valores: string[]) => [...new Set(valores)].filter((v) => !(v in dic));

  it("giros, unidades y formas de pago tienen traducción", () => {
    expect(falta(en.datos.giros, d.mercados.flatMap((m) => m.giros))).toEqual([]);
    expect(falta(en.datos.girosPuesto, d.interior.puestos.map((p) => p.giro))).toEqual([]);
    expect(falta(en.datos.pagos, d.interior.puestos.flatMap((p) => p.acepta))).toEqual([]);
    const unidades = [
      ...d.interior.puestos.flatMap((p) => p.productos.map((x) => x.u)),
      ...d.huertos.productores.flatMap((p) => [p.precio_mayoreo_app.unidad, p.comercio_justo.unidad]),
      ...d.demo.productor.lotes.map((l) => l.unidad),
    ];
    expect(falta(en.datos.unidades, unidades)).toEqual([]);
    expect(falta(en.datos.dias, d.demo.locatario.semana.map((x) => x.d))).toEqual([]);
    expect(falta(en.datos.entregas, d.demo.locatario.pedidos_pendientes.map((x) => x.tipo))).toEqual([]);
  });

  it("los textos propios de la app traen su versión *_en", () => {
    const sinEn = <T extends object>(xs: T[], campo: string) => xs.filter((x) => !(x as Record<string, unknown>)[`${campo}_en`]);
    expect(sinEn(d.eventos, "titulo")).toEqual([]);
    expect(sinEn(d.eventos, "descripcion")).toEqual([]);
    expect(sinEn(d.rutas, "titulo")).toEqual([]);
    expect(sinEn(d.rutas.filter((r) => r.incluye), "incluye")).toEqual([]);
    expect(sinEn(d.lealtad.niveles, "beneficio")).toEqual([]);
    expect(sinEn(d.lealtad.insignias, "regla")).toEqual([]);
    expect(sinEn(d.lealtad.recompensas, "titulo")).toEqual([]);
    expect(sinEn(d.lealtad.como_se_gana, "accion")).toEqual([]);
    expect(sinEn(d.huertos.productores, "temporada")).toEqual([]);
    expect(sinEn(d.huertos.productores, "entrega")).toEqual([]);
    expect(sinEn(d.huertos.zonas, "descripcion")).toEqual([]);
  });

  it("las listas en inglés tienen el mismo largo que en español", () => {
    for (const p of d.huertos.productores) expect(p.practicas_en?.length).toBe(p.practicas.length);
    for (const z of d.huertos.zonas) expect(z.cultivos_en?.length).toBe(z.cultivos.length);
    for (const planes of Object.values(d.modelo.precios))
      for (const p of planes as { incluye: string[]; incluye_en?: string[] }[]) expect(p.incluye_en?.length).toBe(p.incluye.length);
  });
});
