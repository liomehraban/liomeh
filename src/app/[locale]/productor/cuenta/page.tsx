import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { datosProductor } from "@/data/vistas-demo";
import { AjustesDemo } from "@/components/shell/AjustesDemo";
import { FilaPlan } from "@/components/locatario/FilaPlan";
import { TarjetaCuenta } from "@/components/locatario/TarjetaCuenta";
import { tituloPagina } from "@/i18n/titulo";

export const generateMetadata = tituloPagina("productorCuenta");

export default async function CuentaPage({ params }: PageProps<"/[locale]/productor/cuenta">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const { productor: p, demo, planProductor } = await datosProductor();

  return (
    <div className="flex flex-col">
      <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-4xl">{t("paginas.productorCuenta")}</h1>
      </header>
      <div className="flex flex-col gap-4 p-5">
        {/* Perfil del huerto: los mismos datos que usan Cosecha y Mi huerto (usuarios_demo + huertos.json). */}
        <TarjetaCuenta
          titulo={t("productor.cuenta.perfil")}
          nombre={p.nombre}
          detalle={p.producto_principal}
          titular={t("productor.titular", { titular: p.titular })}
          ubicacion={`${p.pueblo}, ${p.alcaldia}`}
        >
          {/* El productor no tiene página de planes: el renglón informa, sin enlace. */}
          <FilaPlan plan={planProductor?.plan ?? demo.plan} />
        </TarjetaCuenta>
        <AjustesDemo />
      </div>
    </div>
  );
}
