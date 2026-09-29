import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { AjustesDemo } from "@/components/shell/AjustesDemo";
import { Proximamente } from "@/components/shell/Proximamente";

export default async function YoPage({ params }: PageProps<"/[locale]/yo">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const { usuario_demo } = await getRepository().lealtad();

  return (
    <div className="flex flex-col">
      <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-4xl">{t("yo.hola", { nombre: usuario_demo.nombre })}</h1>
      </header>
      <div className="flex flex-col gap-5 p-5">
        <AjustesDemo />
      </div>
      <Proximamente pagina="yo" fase="5" categoria="dulces" sinEncabezado />
    </div>
  );
}
