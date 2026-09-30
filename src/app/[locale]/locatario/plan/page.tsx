import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosLocatario } from "@/data/vistas-demo";
import { PlanLocatarioView } from "@/components/locatario/PlanLocatarioView";
import { tituloPagina } from "@/i18n/titulo";

export const generateMetadata = tituloPagina("locatarioPlan");

export default async function PlanLocatarioPage({ params }: PageProps<"/[locale]/locatario/plan">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosLocatario();
  return <PlanLocatarioView planes={d.planes} />;
}
