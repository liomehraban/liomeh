import { MapPinOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PantallaError } from "@/components/errores/PantallaError";

/** 404 bilingüe con la identidad de la app (mercados, puestos o rutas que no existen). */
export default function NoEncontrado() {
  const t = useTranslations("errores");
  return (
    <PantallaError icono={MapPinOff} titulo={t("noEncontradoTitulo")} texto={t("noEncontradoTexto")}>
      <Button asChild>
        <Link href="/explorar">{t("irExplorar")}</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/">{t("inicio")}</Link>
      </Button>
    </PantallaError>
  );
}
