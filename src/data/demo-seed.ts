/**
 * Estado inicial de la demo (usuario, puntos, sellos, lotes…), tomado de los JSON.
 * Separado del MockRepository para que el store del cliente no cargue los 346 mercados.
 */
import lealtadJson from "../../data/lealtad.json";
import demoJson from "../../data/usuarios_demo.json";
import { Lealtad, UsuariosDemo } from "@/lib/schemas";

const lealtad = Lealtad.parse(lealtadJson);
const demo = UsuariosDemo.parse(demoJson);

export const demoSeed = {
  usuario: lealtad.usuario_demo,
  locatario: demo.locatario,
  productor: demo.productor,
};
