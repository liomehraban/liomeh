/**
 * Textos de /data según el idioma.
 * Los datos traen el texto en español y, cuando existe, su versión `<campo>_en`
 * (mismo patrón que `lema_en` / `resumen_en`). Sin versión en inglés se muestra el español.
 */
export function enIdioma<T extends object, K extends keyof T & string>(obj: T, campo: K, locale: string): T[K] {
  if (locale === "en") {
    const en = (obj as Record<string, unknown>)[`${campo}_en`];
    if (en !== undefined && en !== null && en !== "") return en as T[K];
  }
  return obj[campo];
}

/** Vocabulario cerrado de los datos (unidades, giros, formas de pago…): traduce con el diccionario o deja el valor tal cual. */
export function traducirValor(diccionario: Record<string, string> | undefined, valor: string): string {
  return diccionario?.[valor] ?? valor;
}

/** «80 piezas, 2 ciento» → traduce solo la unidad de cada cantidad. */
export function traducirCantidades(texto: string, unidad: (u: string) => string): string {
  return texto
    .split(", ")
    .map((parte) => parte.replace(/^(\d+(?:[.,]\d+)?)\s+(.+)$/, (_, n: string, u: string) => `${n} ${unidad(u)}`))
    .join(", ");
}
