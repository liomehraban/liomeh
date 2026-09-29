import type { StyleSpecification } from "maplibre-gl";

export const ESTILO_CARTO = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

/** Estilo mínimo si CARTO no responde (offline o red bloqueada): fondo cálido, sin tiles ni glifos. */
export const ESTILO_RESPALDO: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: "fondo", type: "background", paint: { "background-color": "#F3EDE3" } }],
};

let cache: Promise<{ estilo: StyleSpecification; remoto: boolean }> | null = null;

/** Descarga el estilo de CARTO una vez; si falla en 4 s, usa el de respaldo. */
export function cargarEstilo() {
  cache ??= (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch(ESTILO_CARTO, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error(String(r.status));
      return { estilo: (await r.json()) as StyleSpecification, remoto: true };
    } catch {
      cache = null; // reintenta en la siguiente visita
      return { estilo: ESTILO_RESPALDO, remoto: false };
    }
  })();
  return cache;
}
