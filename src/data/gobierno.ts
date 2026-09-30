/** Datos del panel de gobierno (vía repositorio). */
import { getRepository } from "./repository";

export async function datosGobierno() {
  const repo = getRepository();
  const [metricas, mercados] = await Promise.all([repo.metricas(), repo.mercados()]);
  const nombres = Object.fromEntries(mercados.map((m) => [m.id, m.nombre]));
  return {
    metricas,
    nombres,
    mercados: mercados.map((m) => ({ id: m.id, nombre: m.nombre, alcaldia: m.alcaldia, lat: m.lat, lng: m.lng })),
  };
}
