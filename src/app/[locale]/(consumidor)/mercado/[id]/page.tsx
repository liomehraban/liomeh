import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { FichaMercado } from "@/components/market/ficha/FichaMercado";
import { datosFicha } from "@/data/ficha-mercado";

export async function generateStaticParams() {
  const mercados = await getRepository().mercados();
  return mercados.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/mercado/[id]">): Promise<Metadata> {
  const { id, locale } = await params;
  const m = await getRepository().mercado(id);
  if (!m) return {};
  return { title: m.nombre_display, description: (locale === "en" ? (m.resumen_en ?? m.lema_en) : (m.resumen ?? m.lema)) ?? undefined };
}

export default async function MercadoPage({ params }: PageProps<"/[locale]/mercado/[id]">) {
  const { id, locale } = await params;
  setRequestLocale(locale as Locale);
  const datos = await datosFicha(id);
  if (!datos) notFound();
  return <FichaMercado {...datos} />;
}
