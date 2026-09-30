import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { paradasRutas } from "@/data/rutas";
import { DetalleRuta } from "@/components/rutas/DetalleRuta";
import { enIdioma } from "@/lib/idioma";

export async function generateStaticParams() {
  return (await getRepository().rutas()).map((r) => ({ id: r.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/rutas/[id]">): Promise<Metadata> {
  const { id, locale } = await params;
  const r = (await getRepository().rutas()).find((x) => x.id === id);
  return r ? { title: enIdioma(r, "titulo", locale) } : {};
}

export default async function RutaPage({ params }: PageProps<"/[locale]/rutas/[id]">) {
  const { id, locale } = await params;
  setRequestLocale(locale as Locale);
  const [rutas, paradas] = await Promise.all([getRepository().rutas(), paradasRutas()]);
  const ruta = rutas.find((r) => r.id === id);
  if (!ruta) notFound();
  return <DetalleRuta ruta={ruta} paradas={ruta.paradas.map((p) => paradas[p]).filter(Boolean)} />;
}
