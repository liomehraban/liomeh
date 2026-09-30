"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { motion, useReducedMotion } from "motion/react";
import { Bus, DoorOpen, Maximize, Minus, Plus, Star, TrainFront } from "lucide-react";
import { useTranslations } from "next-intl";

import { escalaAjuste, nodoEnPaso, posicionNodo, puntosDeRuta, separarDe, tamEtiqueta, transformacionCentrada, type Margen, type Punto } from "@/lib/interior";
import type { Interior, RutaInterior } from "@/lib/schemas";
import { StallMarker } from "./StallMarker";

export type InteriorMapHandle = { verTodo: () => void };

/** Punto a centrar; `key` distinto fuerza el movimiento. Se re-aplica si cambia el alto disponible. */
export type Foco = Punto & { escala?: number; key: number };

type Props = {
  interior: Interior;
  nombreMercado: string;
  visibles: Set<string>;
  seleccionado: string | null;
  ruta: RutaInterior | null;
  paso: number;
  foco: Foco | null;
  onSelect: (id: string) => void;
  ref?: Ref<InteriorMapHandle>;
};

/** Franja superior tapada por «Plano esquemático · Leyenda» y los botones de zoom (8 + 44 + 8 px). */
const MARGEN_FOCO: Margen = { top: 60 };
/** Encuadre completo: el plano entero, con aire a los lados, debajo de los controles. */
const MARGEN_TODO: Margen = { top: 60, right: 8, bottom: 8, left: 8 };
/** Tamaño mínimo en pantalla de las etiquetas del plano. */
const MIN_PX_ETIQUETA = 10;
/** Distancia mínima (unidades del plano) entre un acceso y un puesto, para que no se encimen. */
const SEPARACION_ACCESO = 30;
const ACCESO_ICONO = { metro: TrainFront, calle: Bus, puerta: DoorOpen } as const;
const ACCESO_COLOR = { metro: "#E4007C", calle: "#1F4E9A", puerta: "#3E1C3C" } as const;

/** Plano SVG por capas: calles → edificios → pasillos → puestos → accesos → ruta → «Estás aquí». */
export function InteriorMap({ interior, nombreMercado, visibles, seleccionado, ruta, paso, foco, onSelect, ref }: Props) {
  const t = useTranslations("interior");
  const reducir = useReducedMotion();
  const cont = useRef<HTMLDivElement>(null);
  const zp = useRef<ReactZoomPanPinchRef>(null);
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const [escala, setEscala] = useState(1);
  const [leyenda, setLeyenda] = useState(false);
  // 22 px en pantalla (44 px de diámetro) expresados en unidades del plano, según el ancho y el zoom actual.
  const pxPorUnidad = tam.w ? (tam.w / interior.lienzo.w) * escala : 1;
  const radioToque = Math.max(16, 22 / pxPorUnidad);
  const { w: LW, h: LH } = interior.lienzo;

  useEffect(() => {
    const el = cont.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTam({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ajuste = tam.w ? escalaAjuste({ w: LW, h: LH }, tam, MARGEN_TODO) : 1;
  const centrar = (p: Punto, escala?: number, margen: Margen = MARGEN_FOCO) => {
    const z = zp.current;
    if (!z || !tam.w) return;
    const e = escala ?? Math.max(z.state.scale, 2.4);
    const tr = transformacionCentrada(p, { w: LW, h: LH }, tam, e, margen);
    z.setTransform(tr.x, tr.y, tr.escala, reducir ? 0 : 450, "easeOut");
  };
  const verTodo = () => centrar({ x: LW / 2, y: LH / 2 }, ajuste, MARGEN_TODO);

  useImperativeHandle(ref, () => ({ verTodo }));

  // Encuadre inicial en cuanto se conoce el tamaño del contenedor.
  const listo = useRef(false);
  useEffect(() => {
    if (!tam.w || listo.current) return;
    listo.current = true;
    // El plano es mucho más ancho que alto: ajustarlo completo al ancho deja etiquetas diminutas y mucho vacío.
    // Arranca más cerca (hasta 1.5× el ajuste, sin pasarse del alto disponible); «Ver todo» muestra el plano entero.
    const todo = escalaAjuste({ w: LW, h: LH }, tam, MARGEN_TODO);
    // Escala (relativa al ancho) con la que el plano llenaría todo el alto libre.
    const alto = (tam.h - (MARGEN_TODO.top ?? 0) - (MARGEN_TODO.bottom ?? 0)) / (LH * (tam.w / LW));
    const e = Math.max(todo, Math.min(todo * 1.5, alto * 0.95));
    const tr = transformacionCentrada({ x: LW / 2, y: LH / 2 }, { w: LW, h: LH }, tam, e, MARGEN_TODO);
    zp.current?.setTransform(tr.x, tr.y, tr.escala, 0);
  }, [tam, LW, LH]);

  // Centra el foco; se repite cuando el panel inferior cambia el alto disponible.
  useEffect(() => {
    if (!foco || !tam.w) return;
    const id = requestAnimationFrame(() => centrar(foco, foco.escala));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco?.key, tam.w, tam.h]);

  const pos = useMemo(() => new Map(interior.grafo.nodos.map((n) => [n.id, n])), [interior]);
  const pts = useMemo(() => (ruta ? puntosDeRuta(interior, ruta) : []), [interior, ruta]);
  const aqui = ruta ? posicionNodo(interior, nodoEnPaso(ruta, paso)) : null;
  const idxAqui = ruta ? ruta.nodos.indexOf(nodoEnPaso(ruta, paso)) : -1;
  const recorrido = idxAqui >= 0 ? pts.slice(0, idxAqui + 1) : [];
  // Accesos desplazados lo justo para no taparse con un puesto vecino (p. ej. Puerta 14 y la estrella de Doña Chela).
  const accesos = useMemo(() => {
    const pts = interior.puestos.map(({ x, y }) => ({ x, y }));
    return interior.accesos.map((a) => ({ ...a, ...separarDe(a, pts, SEPARACION_ACCESO) }));
  }, [interior]);
  const etiqueta = (texto: string, base: number, disponible: number) => tamEtiqueta(texto, base, disponible, pxPorUnidad, MIN_PX_ETIQUETA);
  const str = (p: Punto[]) => p.map(({ x, y }) => `${x},${y}`).join(" ");

  const boton =
    "grid size-11 place-items-center rounded-pill bg-white text-morado shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div ref={cont} className="relative h-full w-full overflow-hidden bg-papel">
      {tam.w > 0 && (
        <TransformWrapper
          ref={zp}
          minScale={Math.min(0.9, ajuste)}
          onTransform={(_, s) => setEscala(Math.round(s.scale * 10) / 10)}
          maxScale={8}
          limitToBounds={false}
          doubleClick={{ step: 0.8 }}
          wheel={{ step: 0.15 }}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: tam.w, height: (tam.w * LH) / LW }}>
            <svg
              viewBox={`0 0 ${LW} ${LH}`}
              width={tam.w}
              height={(tam.w * LH) / LW}
              role="group"
              aria-label={t("planoEtiqueta", { mercado: nombreMercado })}
              className="select-none"
            >
              <rect width={LW} height={LH} fill="#FBF7F2" />
              {/* calles */}
              <g aria-hidden>
                {interior.calles.map((c) => {
                  const vertical = c.x1 === c.x2;
                  const mx = (c.x1 + c.x2) / 2;
                  const my = (c.y1 + c.y2) / 2;
                  // El rótulo arranca después de los accesos de la primera mitad de la calle (no se encima con ellos).
                  const inicio = Math.max(
                    (vertical ? c.y1 : c.x1) + 20,
                    ...accesos
                      .filter((a) => (vertical ? Math.abs(a.x - mx) < 30 && a.y < my : Math.abs(a.y - my) < 30 && a.x < mx))
                      .map((a) => (vertical ? a.y : a.x) + 30),
                  );
                  const fs = etiqueta(c.nombre, 13, (vertical ? c.y2 : c.x2) - 20 - inicio);
                  // Texto centrado sobre el eje de la calle (baseline a +0.35 em).
                  const x0 = vertical ? mx : inicio;
                  const y0 = vertical ? inicio : my;
                  return (
                    <g key={c.nombre}>
                      <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#E8DFD4" strokeWidth={22} strokeLinecap="round" />
                      {fs && (
                        <text
                          x={x0}
                          y={y0 + fs * 0.35}
                          fontSize={fs}
                          fill="#6F5E6D"
                          fontWeight={600}
                          transform={vertical ? `rotate(90 ${x0} ${y0})` : undefined}
                        >
                          {c.nombre}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
              {/* edificios */}
              <g aria-hidden>
                {interior.edificios.map((e) => {
                  // Solo si cabe a lo ancho y a lo alto; los edificios chicos se rotulan al acercarse.
                  const fs = etiqueta(e.nombre, e.w < 100 ? 11 : 17, e.w - 20);
                  return (
                    <g key={e.id}>
                      <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={14} fill={e.color} fillOpacity={0.14} stroke={e.color} strokeWidth={3} />
                      {fs && fs + 12 <= e.h && (
                        <text x={e.x + 10} y={e.y + 6 + fs} fontSize={fs} fontWeight={700} fill="#3E1C3C">
                          {e.nombre}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
              {/* pasillos */}
              <g aria-hidden stroke="#D9CCD7" strokeWidth={5} strokeLinecap="round">
                {interior.grafo.aristas.map((a) => {
                  const p = pos.get(a.a)!;
                  const q = pos.get(a.b)!;
                  return <line key={`${a.a}-${a.b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />;
                })}
              </g>
              {/* ruta activa */}
              {ruta && pts.length > 1 && (
                <g aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={str(pts)} stroke="#FEFAEB" strokeWidth={14} />
                  <motion.polyline
                    key={ruta.id}
                    points={str(pts)}
                    stroke="#9B2694"
                    strokeWidth={8}
                    initial={{ pathLength: reducir ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                  />
                  {recorrido.length > 1 && <polyline points={str(recorrido)} stroke="#3E1C3C" strokeWidth={8} />}
                </g>
              )}
              {/* puestos */}
              <g>
                {interior.puestos.map((p) => (
                  <StallMarker
                    key={p.id}
                    puesto={p}
                    seleccionado={seleccionado === p.id}
                    atenuado={!visibles.has(p.id) && seleccionado !== p.id}
                    etiqueta={t("puestoEtiqueta", { nombre: p.nombre, ubicacion: p.ubicacion_texto })}
                    radioToque={radioToque}
                    onSelect={onSelect}
                  />
                ))}
              </g>
              {/* accesos */}
              <g aria-hidden>
                {accesos.map((a) => {
                  const Icono = ACCESO_ICONO[a.tipo];
                  const numero = a.tipo === "puerta" ? a.id.replace(/\D/g, "") : null;
                  return (
                    <g key={a.id}>
                      <circle cx={a.x} cy={a.y} r={16} fill={ACCESO_COLOR[a.tipo]} stroke="#FFFFFF" strokeWidth={3} />
                      {numero ? (
                        <text x={a.x} y={a.y + 5} fontSize={14} fontWeight={800} fill="#FFFFFF" textAnchor="middle">
                          {numero}
                        </text>
                      ) : (
                        <Icono x={a.x - 10} y={a.y - 10} width={20} height={20} color="#FFFFFF" strokeWidth={2.25} />
                      )}
                    </g>
                  );
                })}
              </g>
              {/* Estás aquí */}
              {aqui && (
                <motion.g initial={false} animate={{ x: aqui.x, y: aqui.y }} transition={{ duration: reducir ? 0 : 0.6, ease: "easeOut" }}>
                  <motion.circle
                    r={22}
                    fill="#1F4E9A"
                    fillOpacity={0.2}
                    animate={reducir ? undefined : { scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <circle r={10} fill="#1F4E9A" stroke="#FFFFFF" strokeWidth={4} />
                  <g transform="translate(0,-26)">
                    <rect x={-46} y={-16} width={92} height={24} rx={12} fill="#1F4E9A" />
                    <text y={1} fontSize={13} fontWeight={700} fill="#FFFFFF" textAnchor="middle">
                      {t("estasAqui")}
                    </text>
                  </g>
                </motion.g>
              )}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      )}

      <div className="absolute top-2 left-2 flex max-w-[65%] flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => setLeyenda((v) => !v)}
          aria-expanded={leyenda}
          className="flex min-h-11 items-center gap-1.5 rounded-pill bg-white px-3 text-xs font-semibold text-tinta-2 shadow-sm"
        >
          {t("esquematico")} · <span className="text-morado">{t("leyenda")}</span>
        </button>
        {leyenda && (
          <ul className="flex flex-col gap-1.5 rounded-2xl bg-white p-3 text-xs font-semibold text-tinta shadow-md">
            <li className="flex items-center gap-2">
              <Star className="size-4 shrink-0 fill-dorado text-dorado" aria-hidden />
              {t("real")}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 shrink-0 rounded-full border-2 border-white bg-chile ring-1 ring-border" aria-hidden />
              {t("leyendaPuesto")}
            </li>
            {(["metro", "calle", "puerta"] as const).map((k) => {
              const I = ACCESO_ICONO[k];
              return (
                <li key={k} className="flex items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full text-white" style={{ background: ACCESO_COLOR[k] }} aria-hidden>
                    <I className="size-3" />
                  </span>
                  {t(k === "calle" ? "parada" : k)}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <button type="button" className={boton} aria-label={t("acercar")} onClick={() => zp.current?.zoomIn(0.5)}>
          <Plus className="size-5" aria-hidden />
        </button>
        <button type="button" className={boton} aria-label={t("alejar")} onClick={() => zp.current?.zoomOut(0.5)}>
          <Minus className="size-5" aria-hidden />
        </button>
        <button type="button" className={boton} aria-label={t("centrar")} onClick={verTodo}>
          <Maximize className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
