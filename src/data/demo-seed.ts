/**
 * Estado inicial de la demo (usuario, puntos, sellos, lotes…), tomado de los JSON.
 * Separado del MockRepository para que el store del cliente no cargue los 346 mercados.
 * No se valida con zod aquí para no llevar zod al bundle del cliente: estos JSON ya se validan
 * en `pnpm validate:data` y en tests/unit (demo-seed.test.ts).
 */
import lealtadJson from "../../data/lealtad.json";
import demoJson from "../../data/usuarios_demo.json";
import type { Lealtad, UsuariosDemo } from "@/lib/schemas";

const lealtad = lealtadJson as unknown as Lealtad;
const demo = demoJson as unknown as UsuariosDemo;

export const demoSeed = {
  usuario: lealtad.usuario_demo,
  // Personas del guion (usuarios_demo.json): Emily (turista, en) y Sofía (consumidora, es).
  turista: demo.turista as { nombre: string },
  consumidora: demo.consumidora as { nombre: string },
  locatario: demo.locatario,
  productor: demo.productor,
};
