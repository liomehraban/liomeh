import { expect, test, type Page } from "@playwright/test";

import interior from "../../data/la_merced_interior.json";

/** Guion de docs/06_demo.md, ejecutado a través del modo presentación (/presentacion). */

type Estado = {
  puntos: number;
  sellos: string[];
  pedidos: { folio: string; resumen: { total: number }; puntos: number }[];
  recordatorios: string[];
  locatario: { cobros: { monto: number }[]; pedidos: { folio?: string }[] };
  productor: { lotes: { cantidad: number; precio: number; producto: string }[] };
};

const estado = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("pasele-demo") ?? "{}").state as Estado);

const ruta = (() => {
  const r = (interior as { rutas_precalculadas: unknown }).rutas_precalculadas as
    | Record<string, { distancia_m: number; minutos_caminando: number; pasos: unknown[] }>
    | { id: string; distancia_m: number; minutos_caminando: number; pasos: unknown[] }[];
  return Array.isArray(r) ? r.find((x) => x.id === "metro-merced__pancita-dona-chela")! : r["metro-merced__pancita-dona-chela"];
})();

async function siguiente(page: Page, alPasar?: () => Promise<void>) {
  const boton = page.locator("[data-demo-siguiente]");
  await expect(boton).toBeEnabled({ timeout: 60_000 });
  await boton.click();
  await expect(boton).toBeDisabled();
  if (alPasar) await alPasar();
  await expect(boton).toBeEnabled({ timeout: 90_000 });
}

test("guion de demo completo sin errores de consola", async ({ page }) => {
  const errores: string[] = [];
  const fallidas: string[] = [];
  page.on("pageerror", (e) => errores.push(String(e)));
  page.on("console", (m) => {
    // Los recursos externos (teselas de CARTO) se validan aparte con `requestfailed`.
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errores.push(m.text());
  });
  // Las cancelaciones (prefetch RSC abandonado al navegar) no son fallas.
  page.on("requestfailed", (r) => {
    if (r.failure()?.errorText !== "net::ERR_ABORTED") fallidas.push(`${r.url()} ${r.failure()?.errorText}`);
  });

  await page.goto("/es/presentacion");
  await page.getByRole("button", { name: "Comenzar demo" }).click();
  const boton = page.locator("[data-demo-siguiente]");

  // 1 · Turista EN busca «pancita»: el mapa centra La Merced y abre la ficha rápida.
  // «Siguiente» debe seguir deshabilitado mientras el paso corre, aunque cambie el idioma.
  await expect(boton).toBeDisabled();
  await expect(page).toHaveURL(/\/en\/explorar/);
  await expect(boton).toBeDisabled();
  await expect(boton).toBeEnabled({ timeout: 60_000 });
  await expect(page.locator('[data-demo="buscar"]')).toHaveValue("pancita");
  await expect(page).toHaveURL(/\/en\/explorar/);
  await expect(page.locator('[data-demo="ver-mercado"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: /La Merced|Merced Nave Mayor/ }).first()).toBeVisible();

  // 2 · Ficha → interior con Pancita Doña Chela resaltada
  await siguiente(page);
  await expect(page).toHaveURL(/\/en\/mercado\/la-merced\/interior\?puesto=pancita-dona-chela/);
  await expect(page.getByRole("region", { name: "Pancita Doña Chela" })).toBeVisible();

  // 3 · Ruta desde Metro Merced: distancia, minutos y pasos iguales a rutas_precalculadas
  await siguiente(page);
  await expect(page.getByText(`${ruta.distancia_m} m · ${ruta.minutos_caminando} min`).first()).toBeVisible();
  await expect(page.getByText(`Step ${ruta.pasos.length} of ${ruta.pasos.length}`)).toBeVisible();
  await expect(page.getByText("You've arrived!")).toBeVisible();

  // 4 · 2 pancitas + 2 sopes, QR CoDi, recoger → folio BB-XXXX, sello y +30 puntos
  const antes4 = await estado(page);
  await siguiente(page);
  await expect(page).toHaveURL(/\/en\/pedido\//);
  const despues4 = await estado(page);
  const pedido = despues4.pedidos[0];
  expect(pedido.folio).toMatch(/^BB-[A-Z0-9]{4}$/);
  expect(pedido.resumen.total).toBe(2 * 115 + 2 * 35 + 9);
  expect(despues4.puntos - antes4.puntos).toBe(Math.floor(pedido.resumen.total / 10));
  expect(despues4.puntos - antes4.puntos).toBe(30);
  expect(despues4.sellos).toContain("la-merced");
  await expect(page.getByText(pedido.folio).first()).toBeVisible();

  // 5 · Consumidora ES: Familia Jurado Nopaleros, precio justo «el doble»
  await siguiente(page);
  await expect(page).toHaveURL(/\/es\/huertos\/prod-milpa-01/);
  const ft = page.locator('[data-demo="fairtrade"]');
  await expect(ft).toContainText("$70");
  await expect(ft).toContainText("$35");
  await expect(ft).toContainText("$150");
  await expect(ft).toContainText("¡El doble!");

  // 6 · Asistente: eventos del mes → Feria Nacional del Mole + Recordarme
  await siguiente(page);
  await expect(page.getByText(/Feria Nacional del Mole/).first()).toBeVisible();
  await expect(page.locator('[data-demo="recordar:mole-2026"]')).toHaveAttribute("aria-pressed", "true");
  expect((await estado(page)).recordatorios).toContain("mole-2026");

  // 7 · Check-in QR en Jugos Moreno pagando en efectivo: +10
  const antes7 = (await estado(page)).puntos;
  await siguiente(page, async () => {
    await expect(page.getByText(/Funciona aunque pagues en efectivo/).first()).toBeVisible({ timeout: 20_000 });
  });
  expect((await estado(page)).puntos - antes7).toBe(10);

  // 8 · Locatario: el pedido del paso 4 aparece en Pedidos; cobra $250 con QR
  await siguiente(page, async () => {
    await expect(page).toHaveURL(/\/es\/locatario\/pedidos/);
    await expect(page.getByText(pedido.folio)).toBeVisible();
    await expect(page.getByText("Pago recibido $250")).toBeVisible({ timeout: 20_000 });
  });
  await expect(page).toHaveURL(/\/es\/locatario$/);
  expect((await estado(page)).locatario.cobros.map((c) => c.monto)).toContain(250);

  // 9 · Productora publica 200 lechugas a $12
  await siguiente(page);
  const lote = (await estado(page)).productor.lotes[0];
  expect(lote).toMatchObject({ cantidad: 200, precio: 12 });
  await expect(page.getByText(/200 piezas/).first()).toBeVisible();

  // 10 · Gobierno → SEDEMA
  await siguiente(page);
  await expect(page).toHaveURL(/\/es\/gobierno/);
  await expect(page.getByRole("tab", { name: "SEDEMA" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("CO₂ evitado").first()).toBeVisible();
  await expect(page.getByText("Alimento rescatado").first()).toBeVisible();

  // Terminar y reiniciar deja todo como en los JSON
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(page).toHaveURL(/\/es\/presentacion/);
  const limpio = await estado(page);
  expect(limpio.pedidos).toHaveLength(0);
  expect(limpio.productor.lotes.some((l) => l.cantidad === 200 && l.precio === 12)).toBe(false);
  expect(limpio.locatario.cobros).toHaveLength(0);

  expect(errores).toEqual([]);
  // Ningún recurso propio (mismo origen) puede fallar
  const origen = new URL(page.url()).origin;
  expect(fallidas.filter((u) => u.startsWith(origen))).toEqual([]);
});

test("los datos de tarjeta nunca salen a la red", async ({ page }) => {
  const filtradas: string[] = [];
  await page.route("**/*", (route) => {
    const r = route.request();
    const todo = `${r.url()} ${r.postData() ?? ""}`;
    if (/4242\s?4242|12\/28|Emily Card/.test(todo)) filtradas.push(r.url());
    return route.continue();
  });
  await page.addInitScript(() => {
    if (!localStorage.getItem("pasele-demo"))
      localStorage.setItem(
        "pasele-demo",
        JSON.stringify({
          state: { perfil: "consumidor", onboardingVisto: true, carrito: [{ puestoId: "pancita-dona-chela", items: [{ nombre: "Sope", precio: 35, unidad: "pieza", qty: 2 }] }] },
          version: 2,
        }),
      );
  });
  await page.goto("/es/checkout?puesto=pancita-dona-chela");
  await page.getByRole("tab", { name: /Tarjeta/ }).click();
  await page.getByLabel("Número de tarjeta").fill("4242 4242 4242 4242");
  await page.getByLabel(/Vigencia/).fill("12/28");
  await page.getByLabel("CVV").fill("123");
  await page.getByLabel(/Nombre/).fill("Emily Card");
  await page.getByRole("button", { name: /^Pagar/ }).click();
  await expect(page).toHaveURL(/\/es\/pedido\//, { timeout: 20_000 });
  expect(filtradas).toEqual([]);
});
