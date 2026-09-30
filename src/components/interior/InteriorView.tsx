"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { BotonVolver } from "@/components/market/ficha/BotonVolver";
import { categoriaGiro, HEX_GIRO, type CategoriaGiro } from "@/lib/giros";
import { esOrigen, nodoEnPaso, posicionNodo, type Origen } from "@/lib/interior";
import { rutaInterior } from "@/lib/routing";
import type { Interior, RutaInterior } from "@/lib/schemas";
import { buscar, crearIndice, type DocBusqueda } from "@/lib/search";
import { cn } from "@/lib/utils";
import { InteriorMap, type Foco, type InteriorMapHandle } from "./InteriorMap";
import { MiniTarjetaPuesto } from "./MiniTarjetaPuesto";
import { RouteSteps } from "./RouteSteps";
import { SelectorOrigen } from "./SelectorOrigen";

type Modo = "explorar" | "origen" | "ruta";

/** M3 · Interior de La Merced: búsqueda, chips, mini tarjeta, «Llévame» y ruta paso a paso. */
export function InteriorView({ interior, nombreMercado }: { interior: Interior; nombreMercado: string }) {
  const t = useTranslations();
  const locale = useLocale() as "es" | "en";
  const params = useSearchParams();
  const mapa = useRef<InteriorMapHandle>(null);

  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [cats, setCats] = useState<CategoriaGiro[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>("explorar");
  const [origen, setOrigen] = useState<Origen>("metro-merced");
  const [rutaSel, setRutaSel] = useState<{ desde: Origen; puestoId: string } | null>(null);
  // Se recalcula con el locale: las instrucciones cambian de idioma al vuelo.
  const ruta = useMemo<RutaInterior | null>(
    () => (rutaSel ? rutaInterior(interior, rutaSel.desde, rutaSel.puestoId, locale) : null),
    [interior, rutaSel, locale],
  );
  const [paso, setPaso] = useState(0);
  const [foco, setFoco] = useState<Foco | null>(null);
  const enfocar = (x: number, y: number, escala?: number) => setFoco({ x, y, escala, key: Date.now() });

  const puesto = sel ? interior.puestos.find((p) => p.id === sel) : undefined;

  const indice = useMemo(() => {
    const docs: DocBusqueda[] = interior.puestos.flatMap((p) => [
      { tipo: "puesto", id: p.id, destino: p.id, titulo: p.nombre, subtitulo: p.ubicacion_texto, campos: { nombre: [p.nombre], giros: [p.giro], productos: p.productos.map((x) => x.n) } },
      ...p.productos.map((x) => ({ tipo: "producto" as const, id: `${p.id}::${x.n}`, destino: p.id, titulo: x.n, subtitulo: p.nombre, campos: { nombre: [x.n] } })),
    ]);
    return crearIndice(docs);
  }, [interior]);

  // Resultados agrupados por puesto (un producto lleva a su puesto).
  const resultados = useMemo(() => {
    const r = buscar(indice, q, 50);
    const mejor = new Map<string, number>();
    for (const x of [...r.puesto, ...r.producto]) mejor.set(x.doc.destino, Math.max(mejor.get(x.doc.destino) ?? 0, x.score));
    return [...mejor.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => interior.puestos.find((p) => p.id === id)!);
  }, [indice, q, interior]);

  const categorias = useMemo(() => {
    const orden: CategoriaGiro[] = ["comida", "frutas", "pescados", "dulces", "flores", "artesanias", "otros"];
    const hay = new Set(interior.puestos.map((p) => categoriaGiro(p.giro)));
    return orden.filter((c) => hay.has(c));
  }, [interior]);

  const visibles = useMemo(() => {
    let ps = interior.puestos;
    if (cats.length) ps = ps.filter((p) => cats.includes(categoriaGiro(p.giro)));
    if (q.trim()) {
      const ids = new Set(resultados.map((p) => p.id));
      ps = ps.filter((p) => ids.has(p.id));
    }
    return new Set(ps.map((p) => p.id));
  }, [interior, cats, q, resultados]);

  const seleccionar = useCallback(
    (id: string) => {
      const p = interior.puestos.find((x) => x.id === id);
      if (!p) return;
      setSel(id);
      setModo("explorar");
      setRutaSel(null);
      setFoco({ x: p.x, y: p.y, key: Date.now() });
    },
    [interior],
  );

  const trazar = useCallback(
    (puestoId: string, desde: Origen) => {
      if (!rutaInterior(interior, desde, puestoId, "es")) return;
      setSel(puestoId);
      setRutaSel({ desde, puestoId });
      setPaso(0);
      setModo("ruta");
      const inicio = posicionNodo(interior, desde);
      if (inicio) setFoco({ ...inicio, escala: 1.8, key: Date.now() });
      const url = new URL(window.location.href);
      url.searchParams.set("puesto", puestoId);
      url.searchParams.set("desde", desde);
      window.history.replaceState(window.history.state, "", url);
    },
    [interior],
  );

  // Deep link: ?puesto=…&desde=… abre la ruta; solo ?puesto=… selecciona y centra.
  const inicial = useRef(false);
  useEffect(() => {
    if (inicial.current) return;
    const p = params.get("puesto");
    const d = params.get("desde");
    if (!p || !interior.puestos.some((x) => x.id === p)) return;
    // espera a que el plano mida su contenedor; la bandera se marca al ejecutar para que un
    // re-render (o el doble montaje de Strict Mode) no cancele el deep link
    const id = setTimeout(() => {
      inicial.current = true;
      if (esOrigen(d)) {
        setOrigen(d);
        trazar(p, d);
      } else seleccionar(p);
    }, 60);
    return () => clearTimeout(id);
  }, [params, interior, trazar, seleccionar]);

  const moverPaso = (i: number) => {
    if (!ruta) return;
    const n = Math.max(0, Math.min(i, ruta.pasos.length - 1));
    setPaso(n);
    const p = posicionNodo(interior, nodoEnPaso(ruta, n));
    if (p) enfocar(p.x, p.y);
  };

  const terminar = () => {
    setModo("explorar");
    setRutaSel(null);
    setPaso(0);
    const url = new URL(window.location.href);
    url.searchParams.delete("desde");
    window.history.replaceState(window.history.state, "", url);
  };

  const elegirResultado = (id: string) => {
    setAbierto(false);
    (document.activeElement as HTMLElement | null)?.blur();
    seleccionar(id);
  };

  const chip =
    "flex h-11 shrink-0 items-center gap-1.5 rounded-pill border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div data-pantalla-completa className="flex h-full flex-col">
      {/* Encabezado: volver, título, buscador y chips */}
      <div className="relative z-20 flex flex-col gap-2 border-b border-border bg-crema px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <div className="flex items-center gap-2 pr-28">
          <BotonVolver fallback={`/mercado/${interior.mercado_id}`} className="shrink-0 bg-morado-50 shadow-none" />
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-[13px] font-semibold text-tinta-2">{nombreMercado}</p>
            <h1 className="truncate font-display text-3xl text-morado-700">{t("interior.titulo")}</h1>
          </div>
        </div>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (resultados[0]) elegirResultado(resultados[0].id);
          }}
          className="relative flex h-12 items-center gap-2 rounded-pill border border-border bg-white px-4 focus-within:ring-[3px] focus-within:ring-ring/40"
        >
          <Search className="size-5 shrink-0 text-morado" aria-hidden />
          <input
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={abierto && !!q.trim()}
            aria-controls="resultados-interior"
            aria-label={t("interior.buscar")}
            placeholder={t("interior.buscar")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-tinta-2/80 [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" aria-label={t("explorar.limpiar")} onClick={() => setQ("")} className="-mr-2 grid size-11 place-items-center rounded-pill text-tinta-2">
              <X className="size-5" aria-hidden />
            </button>
          )}
          {abierto && q.trim() && (
            <ul id="resultados-interior" className="absolute inset-x-0 top-14 z-30 max-h-64 overflow-y-auto rounded-card border border-border bg-white p-2 shadow-xl">
              {resultados.length ? (
                resultados.slice(0, 8).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => elegirResultado(p.id)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-morado-50 focus-visible:bg-morado-50 focus-visible:outline-none"
                    >
                      <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: HEX_GIRO[categoriaGiro(p.giro)] }} />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold">{p.nombre}</span>
                        <span className="truncate text-[13px] text-tinta-2">{p.ubicacion_texto}</span>
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="p-3 text-sm text-tinta-2">{t("interior.sinResultados", { q: q.trim() })}</li>
              )}
            </ul>
          )}
        </form>
        <div className="-mx-4 fila-chips gap-2 px-4">
          {categorias.map((c) => {
            const on = cats.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCats((cs) => (on ? cs.filter((x) => x !== c) : [...cs, c]))}
                className={cn(chip, on ? "border-morado bg-morado text-crema" : "border-border bg-white")}
              >
                <span aria-hidden className="size-2.5 rounded-full" style={{ background: HEX_GIRO[c] }} />
                {t(`giros.${c}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <InteriorMap
          ref={mapa}
          interior={interior}
          nombreMercado={nombreMercado}
          visibles={visibles}
          seleccionado={sel}
          ruta={ruta}
          paso={paso}
          foco={foco}
          onSelect={seleccionar}
        />
      </div>

      {/* Panel inferior: controles al alcance del pulgar */}
      {(puesto || ruta) && (
        <div className="relative z-20 shrink-0 rounded-t-card border-t border-border bg-crema px-5 pt-4 pb-[calc(var(--asoma,0px)+1rem)] shadow-[0_-8px_24px_rgba(62,28,60,0.12)]">
          {modo === "ruta" && ruta && puesto ? (
            <RouteSteps ruta={ruta} paso={paso} onPaso={moverPaso} onTerminar={terminar} nombrePuesto={puesto.nombre} />
          ) : modo === "origen" && puesto ? (
            <SelectorOrigen
              interior={interior}
              valor={origen}
              onCambio={setOrigen}
              onCancelar={() => setModo("explorar")}
              onConfirmar={() => trazar(puesto.id, origen)}
            />
          ) : puesto ? (
            <MiniTarjetaPuesto puesto={puesto} onLlevame={() => setModo("origen")} onCerrar={() => setSel(null)} />
          ) : null}
        </div>
      )}
    </div>
  );
}
