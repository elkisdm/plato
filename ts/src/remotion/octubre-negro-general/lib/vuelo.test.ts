import { describe, expect, it } from 'vitest';

import { posicionVuelo, rastroVuelo } from './vuelo';

const A = { x: 900, y: 300 };
const B = { x: 355, y: 1230 };

describe('posicionVuelo', () => {
  it('parte de A, llega exactamente a B en el cuadro de aterrizaje y no se pasa', () => {
    expect(posicionVuelo(100, 100, 114, A, B)).toEqual(A);
    const fin = posicionVuelo(114, 100, 114, A, B);
    expect(fin.x).toBeCloseTo(B.x, 5);
    expect(fin.y).toBeCloseTo(B.y, 5);
    expect(posicionVuelo(200, 100, 114, A, B)).toEqual(B);
  });

  it('acelera hacia el destino (cae): el último tramo recorre más que el primero', () => {
    const d = (a: number, b: number) => {
      const p = posicionVuelo(a, 100, 114, A, B);
      const q = posicionVuelo(b, 100, 114, A, B);
      return Math.hypot(q.x - p.x, q.y - p.y);
    };
    expect(d(110, 114)).toBeGreaterThan(d(100, 104));
  });
});

describe('rastroVuelo', () => {
  it('devuelve posiciones pasadas con opacidad decreciente y vacío fuera del vuelo', () => {
    const r = rastroVuelo(110, 100, 114, A, B, 5);
    expect(r).toHaveLength(5);
    expect(r[0]!.opacidad).toBeGreaterThan(r[4]!.opacidad);
    expect(rastroVuelo(300, 100, 114, A, B, 5)).toEqual([]);
    expect(rastroVuelo(90, 100, 114, A, B, 5)).toEqual([]);
  });
});
