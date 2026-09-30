import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { PresentacionIntro } from "@/components/presentacion/PresentacionIntro";
import { tituloPagina } from "@/i18n/titulo";

export const generateMetadata = tituloPagina("presentacion");

export default async function PresentacionPage({ params }: PageProps<"/[locale]/presentacion">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PresentacionIntro />;
}
