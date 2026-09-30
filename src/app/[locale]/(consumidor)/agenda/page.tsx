import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { paradasRutas } from "@/data/rutas";
import { AgendaView } from "@/components/agenda/AgendaView";

export async function generateMetadata({ params }: PageProps<"/[locale]/agenda">) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "agenda" });
  return { title: t("titulo") };
}

export default async function AgendaPage({ params }: PageProps<"/[locale]/agenda">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const repo = getRepository();
  const [eventos, rutas, paradas, mercados] = await Promise.all([repo.eventos(), repo.rutas(), paradasRutas(), repo.mercados()]);
  return (
    <Suspense>
      <AgendaView eventos={eventos} rutas={rutas} paradas={paradas} mercados={mercados.map((m) => m.id)} />
    </Suspense>
  );
}
