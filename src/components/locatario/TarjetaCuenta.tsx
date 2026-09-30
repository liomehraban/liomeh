import type { ReactNode } from "react";
import { MapPin, UserRound } from "lucide-react";

/**
 * Tarjeta de perfil en Cuenta (locatario y productor): nombre del puesto o huerto, quién lo atiende y dónde
 * está. Todo viene de los mismos datos que usan Hoy y Cosecha. `children` va al pie (p. ej. el plan actual).
 */
export function TarjetaCuenta({
  titulo,
  nombre,
  titular,
  ubicacion,
  detalle,
  children,
}: {
  titulo: string;
  nombre: string;
  titular: string;
  ubicacion: string;
  detalle?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="cuenta-perfil" className="flex flex-col gap-3 rounded-card border border-border bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 id="cuenta-perfil" className="text-[13px] font-semibold text-tinta-2">
          {titulo}
        </h2>
        <p className="font-display text-3xl leading-none text-morado-700">{nombre}</p>
        {detalle && <p className="text-sm text-tinta-2">{detalle}</p>}
      </div>
      <ul className="flex flex-col gap-1.5 text-sm">
        <li className="flex items-start gap-2">
          <UserRound className="mt-0.5 size-4 shrink-0 text-morado" aria-hidden />
          {titular}
        </li>
        <li className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-morado" aria-hidden />
          {ubicacion}
        </li>
      </ul>
      {children && <div className="border-t border-border pt-1">{children}</div>}
    </section>
  );
}
