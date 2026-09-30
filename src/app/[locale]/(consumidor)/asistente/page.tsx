import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { ChatAsistente } from "@/components/assistant/ChatAsistente";

export async function generateMetadata({ params }: PageProps<"/[locale]/asistente">) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "asistente" });
  return { title: t("titulo") };
}

export default async function AsistentePage({ params }: PageProps<"/[locale]/asistente">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <ChatAsistente />;
}
