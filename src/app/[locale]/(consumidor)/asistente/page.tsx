import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { ChatAsistente } from "@/components/assistant/ChatAsistente";
import { respuestasPreguardadas } from "@/data/respuestas-asistente";

// Las respuestas dependen de la hora («abierto ahora», eventos del mes): se regeneran cada 15 min.
export const revalidate = 900;

export async function generateMetadata({ params }: PageProps<"/[locale]/asistente">) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "asistente" });
  return { title: t("titulo") };
}

export default async function AsistentePage({ params }: PageProps<"/[locale]/asistente">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const messages = await getMessages({ locale: locale as Locale });
  const chips = (messages.asistente as { chips: string[] }).chips;
  return <ChatAsistente preguntas={await respuestasPreguardadas(chips, locale as Locale)} />;
}
