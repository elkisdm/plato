import { describe, expect, it } from 'vitest';

import { estadoFrase, estadoPalabra } from './subtitulosFx';

describe('estadoFrase', () => {
  const ini = 100;
  const fin = 130;
  it('entra con spring: 0.92→1 de escala y sube 12 px', () => {
    const a = estadoFrase(ini, ini, fin);
    expect(a.opacity).toBe(0);
    expect(a.scale).toBeCloseTo(0.92, 2);
    expect(a.y).toBeCloseTo(12, 0);
    const b = estadoFrase(ini + 20, ini, fin);
    expect(b.opacity).toBe(1);
    expect(b.scale).toBeCloseTo(1, 1);
    expect(b.y).toBeCloseTo(0, 0);
  });

  it('sale con un fundido rápido tras la retención', () => {
    expect(estadoFrase(fin + 1, ini, fin).opacity).toBe(1);
    expect(estadoFrase(fin + 8, ini, fin).opacity).toBe(0);
    expect(estadoFrase(fin + 5, ini, fin).opacity).toBeLessThan(1);
  });
});

describe('estadoPalabra', () => {
  it('0 antes de decirse, sube a 1 con la palabra activa y escala 1.06', () => {
    expect(estadoPalabra(99, 100, false).pildora).toBe(0);
    expect(estadoPalabra(99, 100, false).scale).toBe(1);
    const a = estadoPalabra(108, 100, true);
    expect(a.pildora).toBeCloseTo(1, 1);
    expect(a.scale).toBeCloseTo(1.06, 1);
  });

  it('al dejar de ser activa la píldora se apaga', () => {
    expect(estadoPalabra(120, 100, false).pildora).toBe(0);
  });
});
