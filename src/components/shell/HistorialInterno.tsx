"use client";

import { useEffect } from "react";

import { usePathname } from "@/i18n/navigation";

const CLAVE = "bb-historial";

const leer = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) ?? "[]") as string[];
  } catch {
    return [];
  }
};

/** ¿Hay una pantalla de la app a la cual volver? (si no, «atrás» sacaría al usuario del sitio). */
export function puedeVolver(): boolean {
  return leer().length > 1;
}

/**
 * Pila de pantallas visitadas en esta pestaña (sessionStorage): si la nueva ruta es la penúltima, fue un
 * «atrás» y se saca; si no, se agrega. BotonVolver la consulta para no salir de la app con history.back().
 */
export function HistorialInterno() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const pila = leer();
      if (pila.at(-1) === pathname) return;
      if (pila.at(-2) === pathname) pila.pop();
      else pila.push(pathname);
      sessionStorage.setItem(CLAVE, JSON.stringify(pila.slice(-50)));
    } catch {
      // Sin sessionStorage (modo privado estricto): BotonVolver usa su ruta de respaldo.
    }
  }, [pathname]);
  return null;
}
