import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosProductor } from "@/data/vistas-demo";
import { MiHuertoView } from "@/components/productor/MiHuertoView";

export default async function MiHuertoPage({ params }: PageProps<"/[locale]/productor/huerto">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosProductor();
  return <MiHuertoView productor={d.productor} plan={d.planProductor?.plan ?? d.demo.plan} />;
}
