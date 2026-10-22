/**
 * Orden de la lista revuelta. Ítems 0–4 = HECHOS, 5–9 = TITULARES; `ORDEN[slot]` = ítem en ese
 * lugar de la columna única. Fijo (sin azar) para que el cuadro sea determinista.
 */

export const ITEMS_POR_COLUMNA = 5;

const ORDEN = [0, 6, 7, 1, 5, 2, 8, 9, 3, 4] as const;

export const itemEnSlot = (slot: number): number => ORDEN[slot]!;

export const slotDeItem = (item: number): number => ORDEN.indexOf(item as (typeof ORDEN)[number]);
