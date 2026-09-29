import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { AjustesDemo } from "@/components/shell/AjustesDemo";
import { Proximamente } from "@/components/shell/Proximamente";

export default async function CuentaPage({ params }: PageProps<"/[locale]/locatario/cuenta">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("paginas");

  return (
    <div className="flex flex-col">
      <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-4xl">{t("locatarioCuenta")}</h1>
      </header>
      <div className="p-5">
        <AjustesDemo />
      </div>
      <Proximamente pagina="locatarioCuenta" fase="7" sinEncabezado />
    </div>
  );
}
