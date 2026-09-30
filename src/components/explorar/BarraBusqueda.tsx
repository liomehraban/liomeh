"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Sprout, Store, UtensilsCrossed, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { buscar, crearIndice, type DocBusqueda, type TipoResultado } from "@/lib/search";
import { cargarDocsBusqueda } from "./docsBusqueda";

const ICONO: Record<TipoResultado, LucideIcon> = { mercado: MapPin, puesto: Store, producto: UtensilsCrossed, productor: Sprout };
const ORDEN: TipoResultado[] = ["mercado", "puesto", "producto", "productor"];

/**
 * Buscador de Explorar. El índice (mercados, puestos, productos, productores) no viaja en la página:
 * se precarga en segundo plano y, si alguien busca antes, se espera a que llegue.
 */
export function BarraBusqueda({ onElegir }: { onElegir: (d: DocBusqueda) => void }) {
  const t = useTranslations("explorar");
  const [docs, setDocs] = useState<DocBusqueda[] | null>(null);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancelar = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => void cargarDocsBusqueda().then(setDocs).catch(() => {}), { timeout: 2000 });
    return () => cancelar(id);
  }, []);
  const indice = useMemo(() => (docs ? crearIndice(docs) : []), [docs]);
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const resultados = useMemo(() => buscar(indice, q), [indice, q]);
  const hay = ORDEN.some((k) => resultados[k].length);

  const elegir = (d: DocBusqueda) => {
    setAbierto(false);
    (document.activeElement as HTMLElement | null)?.blur();
    onElegir(d);
  };

  return (
    <div className="relative">
      <form
        role="search"
        onSubmit={async (e) => {
          e.preventDefault();
          // Si el índice aún no llega (búsqueda inmediata, p. ej. el modo presentación), se espera.
          const r = docs ? resultados : buscar(crearIndice(await cargarDocsBusqueda().catch(() => [])), q);
          const primero = r.mercado[0] ?? ORDEN.map((k) => r[k][0]).find(Boolean);
          if (primero) elegir(primero.doc);
        }}
        className="flex h-12 items-center gap-2 rounded-pill border border-border bg-white px-4 shadow-md focus-within:ring-[3px] focus-within:ring-ring/40"
      >
        <Search className="size-5 shrink-0 text-morado" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
          placeholder={t("buscar")}
          aria-label={t("buscar")}
          role="combobox"
          data-demo="buscar"
          aria-autocomplete="list"
          aria-expanded={abierto && !!q.trim()}
          aria-controls="resultados-busqueda"
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-tinta-2/80 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setAbierto(false);
            }}
            aria-label={t("limpiar")}
            className="-mr-2 grid size-11 place-items-center rounded-pill text-tinta-2 hover:bg-morado-50"
          >
            <X className="size-5" />
          </button>
        )}
      </form>

      {abierto && q.trim() && (
        <div
          id="resultados-busqueda"
          className="absolute inset-x-0 top-14 z-40 max-h-[60vh] overflow-y-auto rounded-card border border-border bg-white p-2 shadow-xl"
        >
          {!hay && <p className="p-3 text-sm text-tinta-2">{t("sinResultados", { q: q.trim() })}</p>}
          {ORDEN.filter((k) => resultados[k].length).map((k) => {
            const Icono = ICONO[k];
            return (
              <section key={k} aria-labelledby={`grupo-${k}`} className="py-1">
                <h3 id={`grupo-${k}`} className="px-3 py-1 text-[13px] font-bold tracking-wide text-morado-700 uppercase">
                  {t(`grupos.${k}`)}
                </h3>
                <ul>
                  {resultados[k].map(({ doc }) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => elegir(doc)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-morado-50 focus-visible:bg-morado-50 focus-visible:outline-none"
                      >
                        <Icono className="size-5 shrink-0 text-morado" aria-hidden />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-semibold">{doc.titulo}</span>
                          {doc.subtitulo && <span className="truncate text-[13px] text-tinta-2">{doc.subtitulo}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
