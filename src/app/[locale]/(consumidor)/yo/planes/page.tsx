import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { PlanesView } from "@/components/planes/PlanesView";

type PlanModelo = { plan: string; precio: number; moneda?: string; incluye: string[] };

export default async function PlanesPage({ params }: PageProps<"/[locale]/yo/planes">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const modelo = await getRepository().modeloNegocio();
  return <PlanesView planes={(modelo.precios.consumidor ?? []) as PlanModelo[]} />;
}
