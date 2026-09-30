import { expect, test, type Page } from "@playwright/test";

/** Pruebas fuera del guion: sin conexión, avisos, 404, cabeceras y migración del almacenamiento. */

const CLAVE = "bara-bara-demo";

async function entrarComo(page: Page, perfil: string) {
  await page.addInitScript(
    ([clave, p]) => {
      if (!localStorage.getItem(clave)) localStorage.setItem(clave, JSON.stringify({ state: { perfil: p, onboardingVisto: true }, version: 3 }));
    },
    [CLAVE, perfil],
  );
}

test("las páginas inexistentes muestran el 404 propio en cada idioma", async ({ page }) => {
  const es = await page.goto("/es/no-existe/ni-esta");
  expect(es?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();

  const en = await page.goto("/en/mercado/no-existe");
  expect(en?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("las respuestas llevan cabeceras de seguridad", async ({ request }) => {
  const r = await request.get("/es");
  const h = r.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("el estado guardado con la clave anterior se migra a la nueva", async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("sembrado")) {
      sessionStorage.setItem("sembrado", "1");
      localStorage.removeItem("bara-bara-demo");
      localStorage.setItem("pasele-demo", JSON.stringify({ state: { perfil: "consumidor", onboardingVisto: true, puntos: 1234 }, version: 3 }));
    }
  });
  await page.goto("/es/yo");
  await expect(page.getByText(/1,?234 puntos/).first()).toBeVisible();
  const claves = await page.evaluate(() => ({ nueva: localStorage.getItem("bara-bara-demo"), vieja: localStorage.getItem("pasele-demo") }));
  expect(claves.vieja).toBeNull();
  expect(JSON.parse(claves.nueva!).state.puntos).toBe(1234);
});

test("la campana muestra los avisos del perfil y los marca como leídos", async ({ page }) => {
  await entrarComo(page, "locatario");
  await page.goto("/es/locatario");
  const campana = page.getByRole("button", { name: /^Notificaciones/ });
  await expect(campana).toHaveAccessibleName(/nuevas?/, { timeout: 20_000 });
  await campana.click();
  const bandeja = page.getByRole("dialog");
  await expect(bandeja.getByRole("heading", { name: "Notificaciones" })).toBeVisible();
  await expect(bandeja.getByRole("listitem").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(campana).toHaveAccessibleName("Notificaciones");

  // Los avisos del locatario no aparecen como no leídos para otro perfil.
  const noLeidosConsumidor = await page.evaluate((clave) => {
    const s = JSON.parse(localStorage.getItem(clave)!).state as { avisos: { perfil?: string; leida: boolean }[] };
    return s.avisos.filter((a) => a.perfil === "locatario" && !a.leida).length;
  }, CLAVE);
  expect(noLeidosConsumidor).toBe(0);
});

test("sin conexión, una página no visitada cae en la pantalla offline", async ({ page, context }) => {
  test.skip(!!process.env.E2E_BASE_URL, "el proxy del contenedor no deja probar el service worker remoto");
  await entrarComo(page, "consumidor");
  await page.goto("/es/yo");
  // Espera a que el service worker controle la página (precache listo).
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 60_000 });
  await context.setOffline(true);
  await page.goto("/es/agenda?sin-cache=1").catch(() => {});
  await expect(page.getByRole("heading", { name: "Sin conexión" })).toBeVisible();
  // Lo guardado sigue ahí.
  expect(await page.evaluate((clave) => !!localStorage.getItem(clave), CLAVE)).toBe(true);
  await context.setOffline(false);
});

test("compra en un puesto: agregar, ajustar cantidad, ir a pagar y recibir el pedido", async ({ page }) => {
  await entrarComo(page, "consumidor");
  await page.goto("/es/puesto/77-san-juan-ernesto-pugibet--1");
  const primero = page.locator("li[data-demo^='producto:']").first();
  // Un solo control: antes de agregar no hay cantidad suelta que confunda.
  await expect(primero.locator("[data-demo='mas']")).toHaveCount(0);
  await primero.locator("[data-demo='agregar']").click();
  await expect(primero.getByText("En tu pedido")).toBeVisible();
  await primero.locator("[data-demo='mas']").click();
  await expect(primero.locator("output")).toHaveText("2");

  const barra = page.locator("[data-demo='ir-a-pagar']");
  await expect(barra).toContainText("Ir a pagar");
  await expect(barra).toContainText("2 productos en tu pedido");
  await barra.click();
  await expect(page).toHaveURL(/\/es\/checkout\?puesto=77-san-juan-ernesto-pugibet--1/);

  await page.getByRole("tab", { name: /Tarjeta/ }).click();
  await page.getByLabel("Número de tarjeta").fill("4242 4242 4242 4242");
  await page.getByLabel(/Vigencia/).fill("12/28");
  await page.getByLabel("CVV").fill("123");
  await page.getByLabel(/Nombre/).fill("Prueba Demo");
  await page.getByRole("button", { name: /^Pagar/ }).click();
  await expect(page).toHaveURL(/\/es\/pedido\//, { timeout: 20_000 });
  // El carrito de ese puesto queda vacío.
  const carrito = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)!).state.carrito as unknown[], CLAVE);
  expect(carrito).toEqual([]);
});
