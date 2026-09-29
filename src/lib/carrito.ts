/**
 * Carrito agrupado por puesto: un grupo por puesto (un pedido por puesto).
 * Funciones puras; el store las usa para mutar el estado.
 */
export type ItemCarrito = { nombre: string; precio: number; unidad: string; qty: number; huertoId?: string };
export type LineaCarrito = { puestoId: string; items: ItemCarrito[] };

/** true si agregar de `puestoId` abriría un pedido nuevo junto a otro(s) ya existente(s). */
export function requiereNuevoPedido(carrito: LineaCarrito[], puestoId: string): boolean {
  return carrito.length > 0 && !carrito.some((l) => l.puestoId === puestoId);
}

/** Agrega (o suma cantidad si ya está el mismo producto) en el grupo del puesto. */
export function agregarItem(carrito: LineaCarrito[], puestoId: string, item: ItemCarrito): LineaCarrito[] {
  if (item.qty <= 0) return carrito;
  const i = carrito.findIndex((l) => l.puestoId === puestoId);
  if (i < 0) return [...carrito, { puestoId, items: [{ ...item }] }];
  return carrito.map((l, j) => {
    if (j !== i) return l;
    const existe = l.items.some((x) => x.nombre === item.nombre);
    return {
      ...l,
      items: existe ? l.items.map((x) => (x.nombre === item.nombre ? { ...x, qty: x.qty + item.qty } : x)) : [...l.items, { ...item }],
    };
  });
}

/** Cambia la cantidad; con 0 quita el producto y, si el grupo queda vacío, el grupo. */
export function cambiarCantidad(carrito: LineaCarrito[], puestoId: string, nombre: string, qty: number): LineaCarrito[] {
  return carrito
    .map((l) =>
      l.puestoId !== puestoId
        ? l
        : { ...l, items: l.items.flatMap((x) => (x.nombre !== nombre ? [x] : qty > 0 ? [{ ...x, qty }] : [])) },
    )
    .filter((l) => l.items.length > 0);
}

export const subtotalGrupo = (l: LineaCarrito) => l.items.reduce((s, x) => s + x.precio * x.qty, 0);
export const piezasCarrito = (c: LineaCarrito[]) => c.reduce((n, l) => n + l.items.reduce((m, x) => m + x.qty, 0), 0);

/** Huerto de un producto del catálogo: el del origen cuyo producto aparece en el nombre (sin inventar vínculos). */
export function huertoDeProducto(nombre: string, origen: { producto: string; lugar?: string; huerto_id: string | null }[] = []): string | undefined {
  const n = nombre.toLowerCase();
  return origen.find((o) => o.huerto_id && n.includes(o.producto.toLowerCase()))?.huerto_id ?? undefined;
}
