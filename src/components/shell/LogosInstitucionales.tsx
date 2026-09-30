import { useTranslations } from "next-intl";

import { type Institucion, LogoInstitucion } from "@/components/shell/LogoInstitucion";
import { cn } from "@/lib/utils";

const TODAS: Institucion[] = ["cdmx", "turismo", "medioAmbiente", "economia"];

/** Franja «Una iniciativa de…» con los logos de gobierno. */
export function LogosInstitucionales({ className }: { className?: string }) {
  const t = useTranslations("instituciones");
  return (
    <section aria-labelledby="instituciones-titulo" className={cn("flex flex-col gap-3", className)}>
      <h2 id="instituciones-titulo" className="text-center text-[13px] font-semibold text-tinta-2">
        {t("titulo")}
      </h2>
      <ul className="grid grid-cols-2 items-center gap-x-4 gap-y-3 lg:flex lg:flex-wrap lg:justify-center lg:gap-x-8">
        {TODAS.map((id) => (
          <li key={id} className="flex h-10 items-center justify-center">
            <LogoInstitucion id={id} className="max-h-10" />
          </li>
        ))}
      </ul>
    </section>
  );
}
