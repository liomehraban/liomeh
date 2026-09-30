import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosLocatario } from "@/data/vistas-demo";
import { CobrarView } from "@/components/locatario/CobrarView";

export default async function CobrarPage({ params }: PageProps<"/[locale]/locatario/cobrar">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosLocatario();
  return <CobrarView puestoNombre={d.puesto.nombre} puestoId={d.puesto.id} />;
}
