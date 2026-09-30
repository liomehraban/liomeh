/**
 * Candado entre pestañas para el motor de avisos: solo una pestaña genera avisos y pedidos simulados
 * (si no, cada pestaña abierta los duplicaría). La dueña renueva el candado cada pocos segundos;
 * si deja de hacerlo (se cerró), otra lo toma.
 */
const CLAVE = "barabara-motor-avisos";
const VIGENCIA_MS = 12_000;

export function crearCandado(id = Math.random().toString(36).slice(2)) {
  const leer = (): { id: string; ts: number } | null => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    } catch {
      return null;
    }
  };
  /** true si esta pestaña es (o acaba de volverse) la dueña. */
  const tomar = (now = Date.now()) => {
    const c = leer();
    if (c && c.id !== id && now - c.ts < VIGENCIA_MS) return false;
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ id, ts: now }));
    } catch {
      /* sin almacenamiento: esta pestaña se queda con el motor */
    }
    return true;
  };
  const soltar = () => {
    try {
      if (leer()?.id === id) localStorage.removeItem(CLAVE);
    } catch {
      /* nada */
    }
  };
  return { id, tomar, soltar };
}
