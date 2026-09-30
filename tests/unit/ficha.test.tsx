import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import es from "../../messages/es.json";
import en from "../../messages/en.json";

// La navegación de next-intl necesita el router de Next; en el test basta un <a>.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: () => {}, back: () => {}, replace: () => {} }),
  usePathname: () => "/",
}));

const { getRepository } = await import("../../src/data/repository");
const { datosFicha } = await import("../../src/data/ficha-mercado");
const { FichaMercado } = await import("../../src/components/market/ficha/FichaMercado");

const render = async (id: string, locale: "es" | "en" = "es") => {
  const datos = await datosFicha(id);
  if (!datos) throw new Error(`sin datos: ${id}`);
  return renderToString(
    <NextIntlClientProvider locale={locale} messages={locale === "es" ? es : en} timeZone="America/Mexico_City">
      <FichaMercado {...datos} />
    </NextIntlClientProvider>,
  );
};

const mercados = await getRepository().mercados();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;");

describe("M2 · Ficha de mercado", () => {
  it("hay 346 mercados", () => expect(mercados).toHaveLength(346));

  it("las 346 fichas renderizan sin errores (es y en)", async () => {
    for (const m of mercados) {
      for (const loc of ["es", "en"] as const) {
        const html = await render(m.id, loc);
        expect(html, `${m.id} (${loc})`).toContain(esc(m.nombre_display));
        expect(html).toContain(loc === "es" ? "Fuente: Guía de Mercados CDMX 2026" : "Source: Guía de Mercados CDMX 2026");
      }
    }
  });

  it("en inglés muestra lema_en y resumen_en", async () => {
    const m = (await getRepository().mercado("la-merced"))!;
    const html = await render("la-merced", "en");
    expect(html).toContain(esc(m.lema_en!));
    expect(html).toContain(esc(m.resumen_en!));
    expect(html).not.toContain(esc(m.lema!));
  });

  it("La Merced tiene botón de interior y lista de puestos", async () => {
    const html = await render("la-merced");
    expect(html).toContain("Ver mapa interior");
    expect(html).toContain("Pancita Doña Chela");
  });

  it("un mercado no destacado muestra su catálogo simulado de puestos, sin inventar el horario", async () => {
    const html = await render("9-san-lucas");
    expect(html).not.toContain("Este mercado aún no tiene puestos en línea");
    expect(html).toContain('href="/puesto/9-san-lucas--1"');
    expect(html).toContain("Horario no disponible · Pregunta en el mercado");
  });

  it("«Cómo llegar» usa Google Maps en transporte público", async () => {
    const html = await render("la-merced");
    expect(html).toContain("destination=19.4253,-99.1227&amp;travelmode=transit");
  });
});
