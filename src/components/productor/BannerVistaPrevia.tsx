import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

/**
 * Franja de «vista previa» sobre el perfil público del productor: deja claro que es la vista del consumidor y
 * ofrece salir a Mi huerto. Deja libre a la derecha el espacio de los controles flotantes (campana y perfil).
 */
export function BannerVistaPrevia() {
  const t = useTranslations("productor.publico");
  return (
    <div role="note" className="flex items-center gap-3 border-b border-dorado/60 bg-dorado-200 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pr-28 pb-3 text-morado-900">
      <Link
        href="/productor/huerto"
        aria-label={t("salir")}
        className="pressable grid size-11 shrink-0 place-items-center rounded-pill bg-white text-morado shadow-md hover:bg-crema focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <X className="size-5" aria-hidden />
      </Link>
      <p className="flex min-w-0 flex-col leading-tight">
        <span className="text-sm font-bold">{t("banner")}</span>
        <span className="text-[12px] font-semibold">{t("bannerTexto")}</span>
      </p>
    </div>
  );
}
