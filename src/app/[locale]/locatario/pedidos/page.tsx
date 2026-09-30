import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { PedidosView } from "@/components/locatario/PedidosView";

export default async function LocatarioPedidosPage({ params }: PageProps<"/[locale]/locatario/pedidos">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PedidosView />;
}
