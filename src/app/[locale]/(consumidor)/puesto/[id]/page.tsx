import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosPuesto, puestosEnLinea } from "@/data/ficha-puesto";
import { FichaPuesto } from "@/components/stall/FichaPuesto";

export async function generateStaticParams() {
  return (await puestosEnLinea()).map((p) => ({ id: p.puestoId }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/puesto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const d = await datosPuesto(id);
  return d ? { title: `${d.puesto.nombre} · ${d.mercado.nombre}` } : {};
}

export default async function PuestoPage({ params }: PageProps<"/[locale]/puesto/[id]">) {
  const { id, locale } = await params;
  setRequestLocale(locale as Locale);
  const datos = await datosPuesto(id);
  if (!datos) notFound();
  return <FichaPuesto {...datos} />;
}
