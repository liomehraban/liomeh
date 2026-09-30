import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosProductor } from "@/data/vistas-demo";
import { CosechaView } from "@/components/productor/CosechaView";

export default async function CosechaPage({ params }: PageProps<"/[locale]/productor">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosProductor();
  return <CosechaView productor={d.productor} nombre={d.demo.nombre} />;
}
