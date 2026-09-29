/**
 * MapLibre 6 carga su worker como módulo hermano de su propio archivo (import.meta.url),
 * lo que se rompe al empaquetar. Copiamos el worker y su chunk compartido a /public/maplibre
 * y el proveedor llama setWorkerUrl("/maplibre/maplibre-gl-worker.mjs").
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve("maplibre-gl/package.json")) + "/dist";
const destino = join(process.cwd(), "public", "maplibre");
mkdirSync(destino, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(join(dist, f), join(destino, f));
console.log("✓ worker de MapLibre copiado a public/maplibre");
