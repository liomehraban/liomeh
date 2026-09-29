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

const { getRepository } = await import("../../src/data/repository");
const { FichaProductor } = await import("../../src/components/huertos/FichaProductor");
const repo = getRepository();
const zonas = await repo.zonasHuerto();

const render = async (id: string, locale: "es" | "en" = "es") => {
  const p = (await repo.productor(id))!;
  return renderToString(
    <NextIntlClientProvider locale={locale} messages={locale === "es" ? es : en} timeZone="America/Mexico_City">
      <FichaProductor productor={p} zona={zonas.find((z) => z.id === p.zona_id) ?? null} resenas={await repo.resenas(id)} nombres={{}} />
    </NextIntlClientProvider>,
  );
};

describe("M6 · Ficha de productor", () => {
  it("los 14 productores renderizan (es y en)", async () => {
    for (const p of await repo.productores()) for (const loc of ["es", "en"] as const) expect(await render(p.id, loc), p.id).toContain(p.nombre);
  });
  it("Familia Jurado: precio justo y compra al mayoreo", async () => {
    const html = await render("prod-milpa-01");
    expect(html).toContain("De cada $150 del ciento de nopal, $70 se quedan con Familia Jurado Nopaleros (antes $35).");
    expect(html).toContain("Comprar al mayoreo");
    expect(html).toContain("Este huerto no recibe visitas por ahora.");
  });
  it("con visitas_huerto muestra «Reservar visita»", async () => expect(await render("prod-xochi-01")).toContain("Reservar visita"));
});
