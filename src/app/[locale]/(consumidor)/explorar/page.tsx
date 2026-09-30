import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { categoriaMercado } from "@/lib/giros";
import { ratingPromedio } from "@/lib/resenas";
import { documentosBusqueda } from "@/lib/search";
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
  const [mercados, interior, productores] = await Promise.all([repo.mercados(), repo.interior("la-merced"), repo.productores()]);

  const datos: MercadoMapa[] = await Promise.all(
    mercados.map(async (m) => ({
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
      rating: ratingPromedio(await repo.resenas(m.id)),
    })),
  );

  const docs = documentosBusqueda(mercados, interior ? { [interior.mercado_id]: interior.puestos } : {}, productores);

  const [ofertas, metricas] = await Promise.all([ofertasRescate(), repo.metricas()]);

  return <Explorador mercados={datos} docs={docs} rescate={{ ofertas, kpiTon: metricas.kpis_hoy.alimento_rescatado_mes_ton ?? 0 }} />;
}
