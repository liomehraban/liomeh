"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LocateFixed, Loader2, MapPin, Recycle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { MapView, type CapaMapa, type Encuadre, type Enfoque } from "@/components/map/MapView";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MarketCard } from "@/components/market/MarketCard";
import { useRouter } from "@/i18n/navigation";
import { useAhora } from "@/hooks/useAhora";
import { filtrarMercados, FILTROS_VACIOS, type Chip, type FiltrosMapa } from "@/lib/filtros";
import { bbox, CENTRO_CDMX, haversine, masCercanos, ZOCALO, type LatLng } from "@/lib/geo";
import { HEX_GIRO } from "@/lib/giros";
import type { DocBusqueda } from "@/lib/search";
import type { OfertaRescate } from "@/lib/rescate";
import { RescataHoy } from "@/components/rescate/RescataHoy";
import { BarraBusqueda } from "./BarraBusqueda";
import { ChipsFiltro } from "./ChipsFiltro";
import { FichaRapida } from "./FichaRapida";
import { Plegable } from "./Plegable";
import { SheetFiltros } from "./SheetFiltros";
import type { MercadoMapa } from "./tipos";

type Origen = LatLng & { fuente: "gps" | "zocalo" };

/** M1 · Mapa de la ciudad. */
export function Explorador({
  mercados,
  docs,
  rescate,
}: {
  mercados: MercadoMapa[];
  docs: DocBusqueda[];
  rescate: { ofertas: OfertaRescate[]; kpiTon: number };
}) {
  const t = useTranslations();
  const router = useRouter();
  const ahora = useAhora();

  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_VACIOS);
  const [sheetFiltros, setSheetFiltros] = useState(false);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [enfoque, setEnfoque] = useState<Enfoque | null>(null);
  const [encuadre, setEncuadre] = useState<Encuadre | null>(null);
  const [origen, setOrigen] = useState<Origen>({ ...ZOCALO, fuente: "zocalo" });
  const [ubicando, setUbicando] = useState(false);
  const [plegables, setPlegables] = useState({ cerca: true, rescata: false });

  const alcaldias = useMemo(() => [...new Set(mercados.map((m) => m.alcaldia))].sort((a, b) => a.localeCompare(b, "es")), [mercados]);
  const visibles = useMemo(() => filtrarMercados(mercados, filtros, ahora ?? undefined), [mercados, filtros, ahora]);
  const porId = useMemo(() => new Map(mercados.map((m) => [m.id, m])), [mercados]);
  const actual = seleccionado ? porId.get(seleccionado) : undefined;

  const layers = useMemo<CapaMapa[]>(() => {
    const punto = (m: MercadoMapa) => ({ id: m.id, lat: m.lat, lng: m.lng, color: HEX_GIRO[m.categoria], etiqueta: m.nombre });
    return [
      { tipo: "puntos", id: "mercados", cluster: true, estilo: "normal", puntos: visibles.filter((m) => !m.destacado).map(punto) },
      { tipo: "puntos", id: "destacados", estilo: "destacado", puntos: visibles.filter((m) => m.destacado).map(punto) },
    ];
  }, [visibles]);

  const cercanos = useMemo(() => masCercanos(visibles, origen, 8), [visibles, origen]);

  const enfocar = useCallback((p: LatLng, zoom?: number) => setEnfoque({ ...p, zoom, key: Date.now() }), []);

  const seleccionar = useCallback(
    (id: string) => {
      const m = porId.get(id);
      if (!m) return;
      setSeleccionado(id);
      enfocar(m, 15);
    },
    [porId, enfocar],
  );

  const ubicar = useCallback(
    (silencioso = false) => {
      if (!("geolocation" in navigator)) return;
      setUbicando(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setOrigen({ ...p, fuente: "gps" });
          enfocar(p, 14);
          setUbicando(false);
        },
        () => {
          setOrigen({ ...ZOCALO, fuente: "zocalo" });
          if (!silencioso) {
            toast(t("explorar.sinUbicacion"));
            enfocar(ZOCALO, 13);
          }
          setUbicando(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
      );
    },
    [enfocar, t],
  );

  // Si el permiso ya estaba concedido, ubica sin preguntar.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((s) => s.state === "granted" && ubicar(true))
      .catch(() => {});
  }, [ubicar]);

  // Al cerrar el sheet de filtros con alcaldía o tipo, encuadra los mercados que quedaron.
  const cerrarFiltros = (abierto: boolean) => {
    setSheetFiltros(abierto);
    if (abierto || (!filtros.alcaldias.length && !filtros.tipos.length)) return;
    const caja = bbox(visibles);
    if (caja) setEncuadre({ bbox: caja, key: Date.now() });
  };

  const toggleChip = (c: Chip) =>
    setFiltros((f) => ({ ...f, chips: f.chips.includes(c) ? f.chips.filter((x) => x !== c) : [...f.chips, c] }));

  const onBuscar = (d: DocBusqueda) => {
    if (d.tipo === "mercado") seleccionar(d.destino);
    else if (d.tipo === "productor") router.push(`/huertos/${d.destino}`);
    else router.push(`/puesto/${d.destino}`);
  };

  return (
    <div className="relative h-full overflow-hidden">
      <MapView
        center={CENTRO_CDMX}
        zoom={11}
        layers={layers}
        seleccionado={seleccionado}
        onSelect={seleccionar}
        enfoque={enfoque}
        encuadre={encuadre}
        ubicacion={origen.fuente === "gps" ? origen : null}
        paddingInferior={220}
        ariaLabel={t("mapa.etiqueta")}
      />

      {/* Buscador + chips */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4 [&>*]:pointer-events-auto">
        <div className="mr-14">
          <BarraBusqueda docs={docs} onElegir={onBuscar} />
        </div>
        <ChipsFiltro activos={filtros.chips} onToggle={toggleChip} onFiltros={() => setSheetFiltros(true)} nFiltros={filtros.alcaldias.length + filtros.tipos.length} />
        <p className="self-start rounded-pill bg-white px-3 py-1 text-[13px] font-semibold text-tinta-2 shadow-sm" aria-live="polite">
          {t("explorar.conteo", { n: visibles.length })}
        </p>
      </div>

      {/* Mi ubicación */}
      <button
        type="button"
        onClick={() => ubicar()}
        aria-label={ubicando ? t("explorar.ubicando") : t("explorar.miUbicacion")}
        className="absolute right-4 bottom-[calc(var(--alto-inferior,0px)+1rem)] z-20 grid size-12 place-items-center rounded-full bg-white text-morado shadow-lg transition-[bottom] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        style={{ ["--alto-inferior" as string]: actual ? "262px" : plegables.cerca ? "196px" : "96px" }}
      >
        {ubicando ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <LocateFixed className="size-5" aria-hidden />}
      </button>

      {/* Carruseles inferiores */}
      {!actual && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-card border-t border-border bg-white pb-2 shadow-[0_-8px_24px_rgba(62,28,60,0.12)]">
          <Plegable
            titulo={t("explorar.cercaDeTi")}
            icono={<MapPin className="size-5 text-morado" aria-hidden />}
            abierto={plegables.cerca}
            onToggle={() => setPlegables((p) => ({ ...p, cerca: !p.cerca }))}
            extra={origen.fuente === "zocalo" && <span className="text-[13px] text-tinta-2">· {t("explorar.desdeZocalo")}</span>}
          >
            <ul className="flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {cercanos.map((m) => (
                <li key={m.id} className="w-64 shrink-0 snap-start">
                  <MarketCard m={{ ...m, distancia: m.distancia }} compacta />
                </li>
              ))}
            </ul>
          </Plegable>
          <Plegable
            titulo={t("explorar.rescataHoy")}
            icono={<Recycle className="size-5 text-nopal-700" aria-hidden />}
            abierto={plegables.rescata}
            onToggle={() => setPlegables((p) => ({ ...p, rescata: !p.rescata }))}
          >
            <RescataHoy ofertas={rescate.ofertas} kpiTon={rescate.kpiTon} />
          </Plegable>
        </div>
      )}

      <BottomSheet
        abierto={!!actual}
        onCerrar={() => setSeleccionado(null)}
        etiqueta={actual?.nombre ?? ""}
        etiquetaCerrar={t("explorar.cerrarFicha")}
        etiquetaExpandir={t("explorar.expandir")}
        alturas={{ peek: 250, mitad: 0.5, completa: 0.9 }}
      >
        {actual && <FichaRapida m={actual} distancia={haversine(origen, actual)} desdeZocalo={origen.fuente === "zocalo"} />}
      </BottomSheet>

      <SheetFiltros
        abierto={sheetFiltros}
        onAbierto={cerrarFiltros}
        filtros={filtros}
        onCambio={setFiltros}
        alcaldias={alcaldias}
        resultados={visibles.length}
      />
    </div>
  );
}

