import { describe, expect, it } from 'vitest';

import { trazoOnduloso } from './trazos';

describe('trazoOnduloso', () => {
  it('empieza y termina en los extremos pedidos', () => {
    const t = trazoOnduloso(10, 20, 310, 60, 'a');
    expect(t.puntos[0]).toEqual({ x: 10, y: 20 });
    expect(t.puntos[t.puntos.length - 1]).toEqual({ x: 310, y: 60 });
    expect(t.d.startsWith('M 10 20')).toBe(true);
  });

  it('mide al menos la distancia recta y es determinista', () => {
    const t = trazoOnduloso(0, 0, 300, 0, 'b');
    expect(t.largo).toBeGreaterThanOrEqual(300);
    expect(trazoOnduloso(0, 0, 300, 0, 'b')).toEqual(t);
  });

  it('semillas distintas dan trazos distintos', () => {
    expect(trazoOnduloso(0, 0, 300, 0, 'a').d).not.toBe(trazoOnduloso(0, 0, 300, 0, 'z').d);
  });

  it('los puntos intermedios se desvían poco de la recta', () => {
    const t = trazoOnduloso(0, 0, 300, 0, 'c', 7, 6);
    for (const p of t.puntos) expect(Math.abs(p.y)).toBeLessThanOrEqual(6);
  });
});
