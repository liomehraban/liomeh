import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { PedidosMayoreoView } from "@/components/productor/PedidosMayoreoView";
import { tituloPagina } from "@/i18n/titulo";

export const generateMetadata = tituloPagina("productorPedidos");

export default async function PedidosMayoreoPage({ params }: PageProps<"/[locale]/productor/pedidos">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PedidosMayoreoView />;
}
