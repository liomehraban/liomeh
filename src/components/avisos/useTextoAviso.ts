"use client";

import { useLocale, useTranslations } from "next-intl";

import type { Aviso } from "@/lib/notificaciones";

/** Título y texto de un aviso en el idioma actual (claves en notificaciones.avisos.*). */
export function useTextoAviso() {
  const t = useTranslations("notificaciones.avisos");
  const locale = useLocale();
  return (a: Pick<Aviso, "clave" | "params">) => {
    // Datos con versión en inglés (p. ej. lotes de «Rescata hoy»).
    const params = locale === "en" && a.params.producto_en ? { ...a.params, producto: a.params.producto_en } : a.params;
    return {
      titulo: t(`${a.clave}.titulo` as "checkin.titulo", params),
      texto: t(`${a.clave}.texto` as "checkin.texto", params),
    };
  };
}
