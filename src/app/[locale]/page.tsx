import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Entrada } from "@/components/entrada/Entrada";

export default async function EntradaPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <Entrada />;
}
