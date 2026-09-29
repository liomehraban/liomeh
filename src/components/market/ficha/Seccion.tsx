import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Seccion({ titulo, children, className, extra }: { titulo: string; children: ReactNode; className?: string; extra?: ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold text-morado-700">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
