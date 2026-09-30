import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { SinConexion } from "@/components/pwa/SinConexion";

export async function generateMetadata({ params }: PageProps<"/[locale]/offline">) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "paginas" });
  return { title: t("offline") };
}

export default async function OfflinePage({ params }: PageProps<"/[locale]/offline">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <SinConexion />;
}
