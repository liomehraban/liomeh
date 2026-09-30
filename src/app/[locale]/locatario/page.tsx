import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosLocatario } from "@/data/vistas-demo";
import { HoyView } from "@/components/locatario/HoyView";
import { tituloPagina } from "@/i18n/titulo";

export const generateMetadata = tituloPagina("locatarioHoy");

export default async function LocatarioHoyPage({ params }: PageProps<"/[locale]/locatario">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosLocatario();
  return <HoyView demo={d.demo} puestoNombre={d.puesto.nombre} mercadoNombre={d.mercado.nombre} resenas={d.resenas} />;
}
