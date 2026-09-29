import { HandHeart, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";

/** Sello «Comercio justo»: dorado con mano y hoja. */
export function SelloComercioJusto() {
  const t = useTranslations("puesto");
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-dorado px-3 py-1 text-[13px] font-bold text-morado-900">
      <span aria-hidden className="flex">
        <HandHeart className="size-4" />
        <Leaf className="-ml-1 size-3" />
      </span>
      {t("comercioJusto")}
    </span>
  );
}
