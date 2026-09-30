/**
 * Persistencia del store en localStorage: mezcla con el estado inicial (campos nuevos o anidados que
 * no existían en versiones anteriores), topes para que no crezca sin fin y escritura tolerante a
 * «cuota llena» (reintenta sin fotos).
 */
import type { StateStorage } from "zustand/middleware";

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Estado guardado sobre el inicial: primer nivel reemplaza; objetos anidados (locatario, productor,
 * asistente, presentación) se mezclan clave por clave para que un campo nuevo nunca quede `undefined`.
 */
export function mezclarEstado<T extends Record<string, unknown>>(base: T, guardado: unknown): T {
  if (!esObjeto(guardado)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(guardado)) {
    if (v === undefined) continue;
    out[k] = esObjeto(base[k]) && esObjeto(v) ? { ...(base[k] as object), ...v } : v;
  }
  return out as T;
}

/** Topes por lista (lo más reciente va primero en todas). */
export const TOPES = {
  pedidos: 50,
  checkins: 200,
  resenasPropias: 50,
  cupones: 50,
  reservasTour: 30,
  reservasVisita: 30,
  catalogoExtra: 60,
  lotes: 40,
  fotos: 12,
} as const;

type ConFoto = { fotoUrl?: string };

/** Aplica topes y deja fotos solo en los elementos más recientes (cada foto pesa ~20–40 KB). */
export function recortarEstado<T extends Record<string, unknown>>(s: T): T {
  const out: Record<string, unknown> = { ...s };
  const cortar = (k: keyof typeof TOPES) => {
    if (Array.isArray(out[k])) out[k] = (out[k] as unknown[]).slice(0, TOPES[k]);
  };
  (["pedidos", "checkins", "resenasPropias", "cupones", "reservasTour", "reservasVisita"] as const).forEach(cortar);
  let fotos = 0;
  const conFotoLimitada = <X extends ConFoto>(xs: X[]) =>
    xs.map((x) => (x.fotoUrl && fotos++ >= TOPES.fotos ? { ...x, fotoUrl: undefined } : x));
  if (Array.isArray(out.resenasPropias)) out.resenasPropias = conFotoLimitada(out.resenasPropias as ConFoto[]);
  if (esObjeto(out.locatario) && Array.isArray(out.locatario.catalogoExtra))
    out.locatario = { ...out.locatario, catalogoExtra: conFotoLimitada((out.locatario.catalogoExtra as ConFoto[]).slice(0, TOPES.catalogoExtra)) };
  if (esObjeto(out.productor) && Array.isArray(out.productor.lotes))
    out.productor = { ...out.productor, lotes: conFotoLimitada((out.productor.lotes as ConFoto[]).slice(0, TOPES.lotes)) };
  // Fichas de vendedores: solo las que siguen en uso (carrito o pedidos).
  if (esObjeto(out.vendedores)) {
    const usados = new Set<string>([
      ...((out.carrito as { puestoId: string }[] | undefined) ?? []).map((l) => l.puestoId),
      ...((out.pedidos as { puestoId: string }[] | undefined) ?? []).map((p) => p.puestoId),
    ]);
    out.vendedores = Object.fromEntries(Object.entries(out.vendedores).filter(([id]) => usados.has(id)));
  }
  return out as T;
}

/** Quita todas las fotos (data URL) de un JSON serializado del store. */
export const sinFotos = (json: string) => json.replace(/"fotoUrl":"data:[^"]*"/g, '"fotoUrl":null');

/** localStorage que no truena: si se llena, reintenta sin fotos; si tampoco cabe, lo reporta y sigue. */
export function almacenamientoSeguro(base: () => Storage): StateStorage {
  return {
    getItem: (k) => {
      try {
        return base().getItem(k);
      } catch {
        return null;
      }
    },
    setItem: (k, v) => {
      try {
        base().setItem(k, v);
      } catch {
        try {
          base().setItem(k, sinFotos(v));
        } catch (e) {
          console.warn("No se pudo guardar el estado de la demo", e);
        }
      }
    },
    removeItem: (k) => {
      try {
        base().removeItem(k);
      } catch {
        /* sin almacenamiento disponible */
      }
    },
  };
}
