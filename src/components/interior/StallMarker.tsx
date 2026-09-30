"use client";

import type { KeyboardEvent } from "react";

import type { Puesto } from "@/lib/schemas";
import { categoriaGiro, HEX_GIRO } from "@/lib/giros";

const estrella = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** Puesto en el plano: punto con el color del giro; los reales según la guía llevan estrella dorada. */
export function StallMarker({
  puesto,
  seleccionado,
  atenuado,
  etiqueta,
  onSelect,
}: {
  puesto: Puesto;
  seleccionado: boolean;
  atenuado: boolean;
  etiqueta: string;
  onSelect: (id: string) => void;
}) {
  const color = HEX_GIRO[categoriaGiro(puesto.giro)];
  const { x, y } = puesto;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(puesto.id);
    }
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={etiqueta}
      aria-pressed={seleccionado}
      data-puesto={puesto.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(puesto.id);
      }}
      onKeyDown={onKey}
      className="cursor-pointer outline-none [&:focus-visible>.foco]:opacity-100"
      opacity={atenuado ? 0.25 : 1}
    >
      {/* área táctil generosa */}
      <circle cx={x} cy={y} r={16} fill="transparent" />
      <circle className="foco opacity-0" cx={x} cy={y} r={15} fill="none" stroke="#9B2694" strokeWidth={3} />
      {seleccionado && <circle cx={x} cy={y} r={14} fill="none" stroke="#3E1C3C" strokeWidth={2.5} />}
      {puesto.real_segun_guia ? (
        <polygon points={estrella(x, y, seleccionado ? 12 : 10)} fill="#F2B01E" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      ) : (
        <circle cx={x} cy={y} r={seleccionado ? 8 : 6} fill={color} stroke="#FFFFFF" strokeWidth={2} />
      )}
    </g>
  );
}
