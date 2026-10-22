import { describe, expect, it } from 'vitest';

import { MARGEN_LATERAL_FICHAS, posicionFicha, TOTAL_FICHAS, tamanoCuadricula } from './fichas27';

describe('cuadrícula de 27 fichas', () => {
  for (const variante of ['grande', 'compacta'] as const) {
    it(`${variante}: 27 posiciones únicas dentro de los márgenes laterales`, () => {
      const ps = Array.from({ length: TOTAL_FICHAS }, (_, i) =>
        posicionFicha(i, variante, MARGEN_LATERAL_FICHAS, 500),
      );
      expect(new Set(ps.map((p) => `${p.x},${p.y}`)).size).toBe(27);
      for (const p of ps) {
        expect(p.x).toBeGreaterThanOrEqual(120);
        expect(p.x + p.ancho).toBeLessThanOrEqual(1080 - 120);
      }
    });

    it(`${variante}: el tamaño total envuelve la última ficha`, () => {
      const { ancho, alto } = tamanoCuadricula(variante);
      const ultima = posicionFicha(26, variante, 0, 0);
      expect(ultima.y + ultima.alto).toBeLessThanOrEqual(alto);
      expect(ancho).toBeLessThanOrEqual(840);
    });
  }

  it('lanza si el índice no existe', () => {
    expect(() => posicionFicha(27, 'grande', 0, 0)).toThrow();
    expect(() => posicionFicha(-1, 'grande', 0, 0)).toThrow();
  });
});
