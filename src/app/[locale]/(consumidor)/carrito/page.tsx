import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { resumenPuestos } from "@/data/comercio";
import { CarritoView } from "@/components/cart/CarritoView";

export default async function CarritoPage({ params }: PageProps<"/[locale]/carrito">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <CarritoView puestos={await resumenPuestos()} />;
}
