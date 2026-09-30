import type { DocBusqueda } from "@/lib/search";

let promesa: Promise<DocBusqueda[]> | null = null;

/** Descarga (una vez por sesión) el índice de búsqueda de Explorar. Si falla, se reintenta la próxima vez. */
export function cargarDocsBusqueda(): Promise<DocBusqueda[]> {
  promesa ??= fetch("/api/busqueda")
    .then((r) => (r.ok ? (r.json() as Promise<DocBusqueda[]>) : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      promesa = null;
      throw e;
    });
  return promesa;
}
