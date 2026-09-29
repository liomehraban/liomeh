import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import es from "../../messages/es.json";
import en from "../../messages/en.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: () => {}, back: () => {}, replace: () => {} }),
  usePathname: () => "/",
}));

const { datosPuesto, puestosEnLinea } = await import("../../src/data/ficha-puesto");
const { FichaPuesto } = await import("../../src/components/stall/FichaPuesto");

const render = async (id: string, locale: "es" | "en" = "es") => {
  const d = await datosPuesto(id);
  if (!d) throw new Error(`sin datos: ${id}`);
  return renderToString(
    <NextIntlClientProvider locale={locale} messages={locale === "es" ? es : en} timeZone="America/Mexico_City">
      <FichaPuesto {...d} />
    </NextIntlClientProvider>,
  );
};

describe("M4 · Puesto", () => {
  it("los 56 puestos de La Merced renderizan (es y en)", async () => {
    const ps = await puestosEnLinea();
    expect(ps).toHaveLength(56);
    for (const { puestoId } of ps) for (const loc of ["es", "en"] as const) expect(await render(puestoId, loc), `${puestoId} (${loc})`).toContain(loc === "es" ? "Agregar" : "Add");
  });
  it("Pancita Doña Chela: catálogo, cómo llegar dentro y check-in", async () => {
    const html = await render("pancita-dona-chela");
    expect(html).toContain("Pancita (pata, libro y cuaderno)");
    expect(html).toContain("/mercado/la-merced/interior?puesto=pancita-dona-chela");
    expect(html).toContain("/yo/escanear?puesto=pancita-dona-chela");
  });
  it("origen con huerto enlaza al productor", async () => {
    const html = await render("nm-a2");
    expect(html).toContain("/huertos/prod-milpa-01");
  });
  it("en inglés muestra el aproximado en USD", async () => {
    expect(await render("pancita-dona-chela", "en")).toContain("≈ US$");
  });
  it("id inexistente → null", async () => expect(await datosPuesto("no-existe")).toBeNull());
});
