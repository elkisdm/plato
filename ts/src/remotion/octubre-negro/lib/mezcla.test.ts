import { describe, expect, it } from 'vitest';

import { ITEMS_POR_COLUMNA, itemEnSlot, slotDeItem } from './mezcla';

describe('mezcla de hechos y titulares', () => {
  const n = ITEMS_POR_COLUMNA * 2;

  it('es una permutación: cada ítem ocupa exactamente un slot', () => {
    const slots = Array.from({ length: n }, (_, i) => slotDeItem(i));
    expect(new Set(slots).size).toBe(n);
    expect(Math.min(...slots)).toBe(0);
    expect(Math.max(...slots)).toBe(n - 1);
  });

  it('itemEnSlot invierte a slotDeItem', () => {
    for (let i = 0; i < n; i += 1) expect(itemEnSlot(slotDeItem(i))).toBe(i);
  });

  it('revuelve: los primeros 4 slots contienen hechos y titulares', () => {
    const tipos = [0, 1, 2, 3].map((s) => itemEnSlot(s) < ITEMS_POR_COLUMNA);
    expect(tipos).toContain(true);
    expect(tipos).toContain(false);
  });
});
