"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Leaf, Sprout } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { MapView, type CapaMapa, type Enfoque } from "@/components/map/MapView";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { NumeroAnimado } from "@/components/motion/NumeroAnimado";
import { Switch } from "@/components/ui/switch";
import { Plegable } from "@/components/explorar/Plegable";
import { useAhora } from "@/hooks/useAhora";
import { HEX_GIRO, type CategoriaGiro } from "@/lib/giros";
import { enIdioma } from "@/lib/idioma";
import { anilloGeoJSON, CULTIVOS, filtrarProductores, mesCDMX, type Cultivo } from "@/lib/huertos";
import type { Productor, ZonaHuerto } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { FichaProductorRapida } from "./FichaProductorRapida";
import { FichaZona } from "./FichaZona";
import { TarjetaProductor } from "./TarjetaProductor";

export type MercadoPunto = { id: string; lat: number; lng: number; categoria: CategoriaGiro; nombre: string };

const CENTRO = { lat: 19.21, lng: -99.075 };

const chip =
  "flex h-11 shrink-0 items-center gap-1.5 rounded-pill border px-3.5 text-sm font-semibold whitespace-nowrap shadow-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

/** M6 · Mapa de huertos. */
export function HuertosView({ zonas, productores, mercados }: { zonas: ZonaHuerto[]; productores: Productor[]; mercados: MercadoPunto[] }) {
  const t = useTranslations("huertos");
  const locale = useLocale();
  const tp = useTranslations("paginas");
  const ahora = useAhora();
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [temporada, setTemporada] = useState(false);
  const [conMercados, setConMercados] = useState(false);
  const [sel, setSel] = useState<{ tipo: "zona" | "productor"; id: string } | null>(null);
  const [enfoque, setEnfoque] = useState<Enfoque | null>(null);
  const [lista, setLista] = useState(true);

  const mes = mesCDMX(ahora ?? undefined);
  const visibles = useMemo(() => filtrarProductores(productores, { cultivos, temporada }, mes), [productores, cultivos, temporada, mes]);

  const layers = useMemo<CapaMapa[]>(() => {
    const capas: CapaMapa[] = [
      { tipo: "zonas", id: "zonas", color: "#3C8D2F", zonas: zonas.map((z) => ({ id: z.id, nombre: enIdioma(z, "nombre", locale), anillo: anilloGeoJSON(z.poligono_ilustrativo) })) },
    ];
    if (conMercados) {
      capas.push({
        tipo: "puntos",
        id: "mercados",
        cluster: true,
        estilo: "atenuado",
        interactiva: false,
        puntos: mercados.map((m) => ({ id: m.id, lat: m.lat, lng: m.lng, color: HEX_GIRO[m.categoria], etiqueta: m.nombre })),
      });
    }
    capas.push({ tipo: "puntos", id: "productores", estilo: "productor", puntos: visibles.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, color: "#FEFAEB", etiqueta: p.nombre })) });
    return capas;
  }, [zonas, visibles, conMercados, mercados, locale]);

  const onSelect = (id: string, capa: string) => {
    if (capa === "zonas") {
      setSel({ tipo: "zona", id });
      const z = zonas.find((x) => x.id === id);
      if (z) setEnfoque({ lat: z.lat, lng: z.lng, zoom: 12, key: Date.now() });
    } else if (capa === "productores") {
      setSel({ tipo: "productor", id });
      const p = productores.find((x) => x.id === id);
      if (p) setEnfoque({ lat: p.lat, lng: p.lng, zoom: 13, key: Date.now() });
    }
  };

  const zona = sel?.tipo === "zona" ? zonas.find((z) => z.id === sel.id) : undefined;
  const prod = sel?.tipo === "productor" ? productores.find((p) => p.id === sel.id) : undefined;

  return (
    <div data-pantalla-completa className="relative h-full overflow-hidden">
      <h1 className="sr-only">{tp("huertos")}</h1>
      <MapView
        center={CENTRO}
        zoom={10}
        layers={layers}
        seleccionado={sel?.id ?? null}
        onSelect={onSelect}
        onVacio={() => setSel(null)}
        enfoque={enfoque}
        paddingInferior={240}
        ariaLabel={t("mapa")}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4 [&>*]:pointer-events-auto">
        <div className="mr-28 flex items-start gap-2 rounded-card bg-nopal-700 p-3 text-white shadow-md">
          <Leaf className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-[13px] leading-snug font-semibold">{t("banner")}</p>
        </div>
        <div className="-mx-4 fila-chips gap-2 px-4 pb-1">
          <button
            type="button"
            aria-pressed={temporada}
            onClick={() => setTemporada((v) => !v)}
            className={cn(chip, temporada ? "border-nopal-700 bg-nopal-700 text-white" : "border-border bg-white")}
          >
            <CalendarCheck className="size-4" aria-hidden />
            {t("temporada")}
          </button>
          {CULTIVOS.map((c) => {
            const on = cultivos.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCultivos((cs) => (on ? cs.filter((x) => x !== c) : [...cs, c]))}
                className={cn(chip, on ? "border-nopal-700 bg-nopal-700 text-white" : "border-border bg-white")}
              >
                {t(`chips.${c}`)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <p className="rounded-pill bg-white px-3 py-1 text-[13px] font-semibold text-tinta-2 shadow-sm" aria-live="polite">
            <NumeroAnimado valor={visibles.length} formato={(n) => t("conteo", { n })} desde={visibles.length} />
          </p>
          <label className="ml-auto flex items-center gap-2 rounded-pill bg-white py-1 pr-1 pl-3 text-[13px] font-semibold shadow-sm">
            {t("mostrarMercados")}
            <Switch checked={conMercados} onCheckedChange={setConMercados} />
          </label>
        </div>
      </div>

      {!sel && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-card border-t border-border bg-white pb-[calc(var(--asoma,0px)+0.5rem)] shadow-[0_-8px_24px_rgba(62,28,60,0.12)]">
          <Plegable
            titulo={t("productores")}
            icono={<Sprout className="size-5 text-nopal-700" aria-hidden />}
            abierto={lista}
            onToggle={() => setLista((v) => !v)}
            nota={t("simuladoCorto")}
          >
            <ul className="carrusel scroll-px-4 gap-3 px-4 pb-2">
              {visibles.map((p) => (
                <li key={p.id} className="w-72 shrink-0 snap-start">
                  <TarjetaProductor p={p} />
                </li>
              ))}
            </ul>
          </Plegable>
        </div>
      )}

      <BottomSheet
        abierto={!!sel}
        onCerrar={() => setSel(null)}
        etiqueta={(zona && enIdioma(zona, "nombre", locale)) ?? prod?.nombre ?? ""}
        etiquetaCerrar={t("cerrar")}
        etiquetaExpandir={t("expandir")}
        alturas={{ peek: 300, mitad: 0.55, completa: 0.9 }}
      >
        {zona && <FichaZona zona={zona} productores={productores.filter((p) => p.zona_id === zona.id)} />}
        {prod && <FichaProductorRapida p={prod} />}
      </BottomSheet>
    </div>
  );
}
