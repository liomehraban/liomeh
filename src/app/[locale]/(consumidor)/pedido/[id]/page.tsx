import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { resumenPuestos } from "@/data/comercio";
import { PedidoView } from "@/components/cart/PedidoView";

export default async function PedidoPage({ params }: PageProps<"/[locale]/pedido/[id]">) {
  const { id, locale } = await params;
  setRequestLocale(locale as Locale);
  const [puestos, productores] = await Promise.all([resumenPuestos(), getRepository().productores()]);
  return <PedidoView folio={decodeURIComponent(id)} puestos={puestos} productores={productores} />;
}
