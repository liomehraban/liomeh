import { proyectar } from "@/lib/rutas";

/** Mapa miniatura de las paradas (SVG, sin tiles): línea punteada y números. */
export function MiniMapaRuta({ puntos, className, etiqueta }: { puntos: { lat: number; lng: number }[]; className?: string; etiqueta?: string }) {
  const W = 120;
  const H = 84;
  const pts = proyectar(puntos, W, H, 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role={etiqueta ? "img" : undefined} aria-label={etiqueta} aria-hidden={etiqueta ? undefined : true}>
      <rect width={W} height={H} rx={12} fill="#F8E9F6" />
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#9B2694" strokeWidth={2.5} strokeDasharray="4 3" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={7} fill={i === 0 ? "#F2B01E" : "#9B2694"} stroke="#FFFFFF" strokeWidth={1.5} />
          <text x={p.x} y={p.y + 3} fontSize={8} fontWeight={800} textAnchor="middle" fill={i === 0 ? "#3E1C3C" : "#FEFAEB"}>
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
