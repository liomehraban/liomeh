import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosLocatario } from "@/data/vistas-demo";
import { CatalogoView } from "@/components/locatario/CatalogoView";

export default async function CatalogoPage({ params }: PageProps<"/[locale]/locatario/catalogo">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosLocatario();
  return <CatalogoView base={d.puesto.productos} productores={d.productores} />;
}
