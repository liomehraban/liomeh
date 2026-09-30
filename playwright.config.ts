import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const PUERTO = Number(process.env.E2E_PORT ?? 3100);
// En el contenedor de Claude Code hay un Chromium preinstalado; en otro entorno se usa el de Playwright.
const CHROMIUM = "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 240_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    hasTouch: false,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    trace: "retain-on-failure",
    launchOptions: existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {},
  },
  webServer: {
    command: `pnpm build && pnpm start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/es`,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
