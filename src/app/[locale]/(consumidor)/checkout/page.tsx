import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { coloniasEntrega, resumenPuestos } from "@/data/comercio";
import { CheckoutView } from "@/components/cart/CheckoutView";

export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const [puestos, colonias] = await Promise.all([resumenPuestos(), coloniasEntrega()]);
  return (
    <Suspense>
      <CheckoutView puestos={puestos} colonias={colonias} />
    </Suspense>
  );
}
