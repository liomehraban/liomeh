import { datosBusqueda } from "@/data/busqueda";

// Se genera en el build: un JSON estático que Explorar descarga al usar el buscador.
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await datosBusqueda());
}
