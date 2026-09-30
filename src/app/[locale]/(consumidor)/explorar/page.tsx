import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { categoriaMercado } from "@/lib/giros";
import { Explorador } from "@/components/explorar/Explorador";
import { ofertasRescate } from "@/data/rescate";
import type { MercadoMapa } from "@/components/explorar/tipos";

export async function generateMetadata({ params }: PageProps<"/[locale]/explorar">) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "paginas" });
  return { title: t("explorar") };
}

export default async function ExplorarPage({ params }: PageProps<"/[locale]/explorar">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const repo = getRepository();
  const [mercados, ratings] = await Promise.all([repo.mercados(), repo.ratings()]);

  const datos: MercadoMapa[] = mercados.map((m) => ({
    id: m.id,
    nombre: m.nombre_display,
    alcaldia: m.alcaldia,
    lat: m.lat,
    lng: m.lng,
    tipos: m.tipos,
    giros: m.giros,
    destacado: m.destacado,
    categoria: categoriaMercado(m),
    lema: m.lema,
    lema_en: m.lema_en,
    horario: m.horario,
    rating: ratings[m.id] ?? null,
  }));;

  const [ofertas, metricas] = await Promise.all([ofertasRescate(), repo.metricas()]);

  return <Explorador mercados={datos} rescate={{ ofertas, kpiTon: metricas.kpis_hoy.alimento_rescatado_mes_ton ?? 0 }} />;
}
