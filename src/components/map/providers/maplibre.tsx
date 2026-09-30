"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { AttributionControl, Marker, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import { setWorkerUrl, type GeoJSONSource, type StyleSpecification } from "maplibre-gl";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { cargarEstilo } from "../estiloBase";
import { idsInteractivos, MarketLayer } from "../MarketLayer";
import { idsZonas, ZoneLayer } from "../ZoneLayer";
import { RouteLayer } from "../RouteLayer";
import type { MapViewProps } from "../types";

// Ver scripts/copy-maplibre-worker.mjs
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export default function MapLibreView({
  center,
  zoom,
  layers,
  onSelect,
  onVacio,
  seleccionado,
  ubicacion,
  enfoque,
  encuadre,
  paddingInferior = 0,
  ariaLabel,
  className,
}: MapViewProps) {
  const t = useTranslations("mapa");
  const ref = useRef<MapRef>(null);
  const [estilo, setEstilo] = useState<{ estilo: StyleSpecification; remoto: boolean } | null>(null);
  const [cursor, setCursor] = useState<string>("");

  useEffect(() => {
    let vivo = true;
    cargarEstilo().then((e) => vivo && setEstilo(e));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!enfoque || !ref.current) return;
    ref.current.flyTo({
      center: [enfoque.lng, enfoque.lat],
      zoom: enfoque.zoom ?? Math.max(ref.current.getZoom(), 15),
      padding: { top: 120, bottom: paddingInferior, left: 0, right: 0 },
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enfoque?.key]);

  useEffect(() => {
    if (!encuadre || !ref.current) return;
    const [a, b, c, d] = encuadre.bbox;
    ref.current.fitBounds([a, b, c, d], {
      padding: { top: 150, bottom: paddingInferior + 20, left: 40, right: 40 },
      maxZoom: 15,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encuadre?.key]);

  const interactivos = useMemo(() => layers.flatMap((c) => (c.tipo === "zonas" ? idsZonas(c) : c.tipo === "ruta" ? [] : idsInteractivos(c))), [layers]);

  const onClick = async (e: MapLayerMouseEvent) => {
    // Si el toque cae en un pin y en una zona, gana el pin.
    const f = e.features?.find((x) => x.geometry.type === "Point") ?? e.features?.[0];
    const map = ref.current;
    if (!map) return;
    if (!f) return onVacio?.();
    const props = f.properties as { id?: string; capa?: string; cluster_id?: number };
    if (props.cluster_id !== undefined) {
      const src = map.getSource(f.source) as GeoJSONSource;
      const z = await src.getClusterExpansionZoom(props.cluster_id);
      const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
      map.easeTo({ center: [lng, lat], zoom: z + 0.1, duration: 500 });
      return;
    }
    if (props.id) onSelect?.(props.id, props.capa ?? f.source);
  };

  return (
    <div className={cn("relative h-full w-full bg-[#F3EDE3]", className)} role="region" aria-label={ariaLabel}>
      {estilo ? (
        <Map
          ref={ref}
          initialViewState={{ latitude: center.lat, longitude: center.lng, zoom }}
          mapStyle={estilo.estilo}
          style={{ width: "100%", height: "100%" }}
          interactiveLayerIds={interactivos}
          onClick={onClick}
          onLoad={() => {
            // Enfoque o encuadre pedidos antes de que el mapa existiera (p. ej. una búsqueda rápida o una ruta).
            if (enfoque && ref.current) {
              ref.current.jumpTo({ center: [enfoque.lng, enfoque.lat], zoom: enfoque.zoom ?? 15, padding: { top: 120, bottom: paddingInferior, left: 0, right: 0 } });
            } else if (encuadre && ref.current) {
              const [a, b, c, d] = encuadre.bbox;
              ref.current.fitBounds([a, b, c, d], { padding: { top: 60, bottom: paddingInferior + 20, left: 40, right: 40 }, maxZoom: 15, duration: 0 });
            }
          }}
          onMouseEnter={() => setCursor("pointer")}
          onMouseLeave={() => setCursor("")}
          cursor={cursor}
          attributionControl={false}
          locale={{ "Map.Title": t("titulo"), "Marker.Title": t("marcador"), "AttributionControl.ToggleAttribution": t("creditos") }}
          dragRotate={false}
          touchPitch={false}
          maxZoom={18}
          minZoom={9}
        >
          {estilo.remoto && <AttributionControl compact position="bottom-left" customAttribution={t("atribucion")} />}
          {layers.map((capa) =>
            capa.tipo === "zonas" ? (
              <ZoneLayer key={capa.id} capa={capa} seleccionado={seleccionado} />
            ) : capa.tipo === "ruta" ? (
              <RouteLayer key={capa.id} capa={capa} onSelect={onSelect} />
            ) : (
              <MarketLayer key={capa.id} capa={capa} seleccionado={seleccionado} conGlifos={estilo.remoto} />
            ),
          )}
          {ubicacion && (
            <Marker latitude={ubicacion.lat} longitude={ubicacion.lng}>
              <span className="block size-4 rounded-full border-[3px] border-white bg-anil shadow-[0_0_0_6px_rgba(31,78,154,0.25)]" />
            </Marker>
          )}
        </Map>
      ) : (
        <p className="absolute inset-0 grid place-items-center text-sm text-tinta-2">{t("cargando")}</p>
      )}
      {estilo && !estilo.remoto && (
        <p className="absolute bottom-2 left-2 rounded-pill bg-white px-3 py-1 text-xs font-semibold text-tinta-2 shadow-sm">
          {t("sinMapaBase")}
        </p>
      )}
    </div>
  );
}
