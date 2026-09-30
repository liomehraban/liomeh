import { useMessages } from "next-intl";

import { traducirValor } from "@/lib/idioma";

type Grupo = keyof IntlMessages["datos"];
type IntlMessages = ReturnType<typeof useMessages>;

/**
 * Traduce valores de vocabulario cerrado que vienen de /data (unidades, giros, formas de pago, planes…)
 * con los diccionarios `datos.*` de messages. Lo que no esté en el diccionario se muestra tal cual.
 */
export function useVocabulario() {
  const m = useMessages();
  return (grupo: Grupo, valor: string) => traducirValor(m.datos[grupo] as Record<string, string>, valor);
}
