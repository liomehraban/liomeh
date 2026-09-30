import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosGobierno } from "@/data/gobierno";
import { PanelGobierno } from "@/components/gobierno/PanelGobierno";

export default async function GobiernoPage({ params }: PageProps<"/[locale]/gobierno">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const d = await datosGobierno();
  return <PanelGobierno {...d} />;
}
