/**
 * Caché en memoria con vigencia: guarda la promesa y la renueva al vencer. Si falla, no se guarda
 * (el siguiente llamado reintenta). Con datos mock casi no importa; con Supabase evita servir datos viejos.
 */
export function cacheConVigencia<T>(
  cargar: () => Promise<T>,
  vigenciaMs: number,
  reloj: () => number = Date.now,
) {
  let valor: { promesa: Promise<T>; hasta: number } | null = null;
  const obtener = (): Promise<T> => {
    const ahora = reloj();
    if (valor && ahora < valor.hasta) return valor.promesa;
    const promesa = cargar();
    const actual = { promesa, hasta: ahora + vigenciaMs };
    valor = actual;
    promesa.catch(() => {
      if (valor === actual) valor = null;
    });
    return promesa;
  };
  /** Olvida el valor (p. ej. después de escribir en la base). */
  obtener.invalidar = () => {
    valor = null;
  };
  return obtener;
}

/** Vigencia de los datos derivados del servidor (misma que la revalidación de las páginas). */
export const VIGENCIA_DATOS_MS = 15 * 60 * 1000;
