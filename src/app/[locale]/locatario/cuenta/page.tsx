import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosLocatario } from "@/data/vistas-demo";
import { AjustesDemo } from "@/components/shell/AjustesDemo";
import { FilaPlan } from "@/components/locatario/FilaPlan";
import { TarjetaCuenta } from "@/components/locatario/TarjetaCuenta";
import { tituloPagina } from "@/i18n/titulo";

export const generateMetadata = tituloPagina("locatarioCuenta");

export default async function CuentaPage({ params }: PageProps<"/[locale]/locatario/cuenta">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const d = await datosLocatario();

  return (
    <div className="flex flex-col">
      <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-4xl">{t("paginas.locatarioCuenta")}</h1>
      </header>
      <div className="flex flex-col gap-4 p-5">
        {/* Perfil del puesto: los mismos datos que usa Hoy (usuarios_demo + ficha del puesto). */}
        <TarjetaCuenta
          titulo={t("locatario.cuenta.perfil")}
          nombre={d.puesto.nombre}
          titular={t("productor.titular", { titular: d.demo.nombre })}
          ubicacion={`${d.mercado.nombre} · ${d.puesto.ubicacion_texto}`}
        >
          <FilaPlan plan={d.demo.plan} href="/locatario/plan" delStore />
        </TarjetaCuenta>
        <AjustesDemo />
      </div>
    </div>
  );
}
