import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { categoriaMercado } from "@/lib/giros";
import { HuertosView } from "@/components/huertos/HuertosView";

export async function generateMetadata({ params }: PageProps<"/[locale]/huertos">) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "huertos" });
  return { title: t("titulo") };
}

export default async function HuertosPage({ params }: PageProps<"/[locale]/huertos">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const repo = getRepository();
  const [zonas, productores, mercados] = await Promise.all([repo.zonasHuerto(), repo.productores(), repo.mercados()]);
  return (
    <HuertosView
      zonas={zonas}
      productores={productores}
      mercados={mercados.map((m) => ({ id: m.id, lat: m.lat, lng: m.lng, categoria: categoriaMercado(m), nombre: m.nombre_display }))}
    />
  );
}
