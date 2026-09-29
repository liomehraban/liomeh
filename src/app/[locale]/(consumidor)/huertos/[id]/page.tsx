import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { resumenPuestos } from "@/data/comercio";
import { FichaProductor } from "@/components/huertos/FichaProductor";

export async function generateStaticParams() {
  return (await getRepository().productores()).map((p) => ({ id: p.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/huertos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await getRepository().productor(id);
  return p ? { title: p.nombre, description: `${p.producto_principal} · ${p.pueblo}, ${p.alcaldia}` } : {};
}

export default async function ProductorPage({ params }: PageProps<"/[locale]/huertos/[id]">) {
  const { id, locale } = await params;
  setRequestLocale(locale as Locale);
  const repo = getRepository();
  const productor = await repo.productor(id);
  if (!productor) notFound();
  const [zonas, resenas, vendedores] = await Promise.all([repo.zonasHuerto(), repo.resenas(id), resumenPuestos()]);
  const nombres = Object.fromEntries(Object.values(vendedores).map((v) => [v.id, v.nombre]));
  return <FichaProductor productor={productor} zona={zonas.find((z) => z.id === productor.zona_id) ?? null} resenas={resenas} nombres={nombres} />;
}
