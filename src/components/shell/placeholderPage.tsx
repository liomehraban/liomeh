import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { CategoriaGiro } from "@/lib/giros";
import { Proximamente, type ClavePagina, type Fase } from "./Proximamente";

/** Genera una página provisional con render estático por locale. */
export function placeholderPage(pagina: ClavePagina, fase: Fase, categoria?: CategoriaGiro) {
  return async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale as Locale);
    return <Proximamente pagina={pagina} fase={fase} categoria={categoria} />;
  };
}
