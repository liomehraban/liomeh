import { getTranslations } from "next-intl/server";

import type messages from "../../messages/es.json";
import type { Locale } from "./routing";

export type ClavePagina = keyof typeof messages.paginas;

/** `generateMetadata` con el título de `paginas.<clave>` en el idioma de la ruta. */
export function tituloPagina(clave: ClavePagina) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale as Locale, namespace: "paginas" });
    return { title: t(clave) };
  };
}
