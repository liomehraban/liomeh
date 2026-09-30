"use client";

import { useTranslations } from "next-intl";

import type { Aviso } from "@/lib/notificaciones";

/** Título y texto de un aviso en el idioma actual (claves en notificaciones.avisos.*). */
export function useTextoAviso() {
  const t = useTranslations("notificaciones.avisos");
  return (a: Pick<Aviso, "clave" | "params">) => ({
    titulo: t(`${a.clave}.titulo` as "checkin.titulo", a.params),
    texto: t(`${a.clave}.texto` as "checkin.texto", a.params),
  });
}
