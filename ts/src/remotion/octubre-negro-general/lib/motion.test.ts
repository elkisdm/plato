import { describe, expect, it } from 'vitest';

import { entrada, entre, rebote } from './motion';

describe('entrada', () => {
  it('clamp en los bordes', () => {
    expect(entrada(0, 10)).toBe(0);
    expect(entrada(10, 10)).toBe(0);
    expect(entrada(22, 10)).toBe(1);
    expect(entrada(500, 10)).toBe(1);
  });

  it('es monótona creciente', () => {
    let prev = -1;
    for (let f = 10; f <= 22; f++) {
      const v = entrada(f, 10);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('respeta la duración dada', () => {
    expect(entrada(20, 0, 20)).toBe(1);
  });
});

describe('entre', () => {
  it('lineal con clamp', () => {
    expect(entre(0, 10, 20)).toBe(0);
    expect(entre(15, 10, 20)).toBe(0.5);
    expect(entre(99, 10, 20)).toBe(1);
  });

  it('es monótona creciente', () => {
    let prev = -1;
    for (let f = 0; f <= 30; f++) {
      const v = entre(f, 5, 25);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe('rebote', () => {
  it('0 antes de empezar y converge a 1', () => {
    expect(rebote(5, 10, 30)).toBe(0);
    expect(rebote(200, 10, 30)).toBeCloseTo(1, 2);
  });

  it('hace overshoot (damping 12)', () => {
    const max = Math.max(...Array.from({ length: 40 }, (_, i) => rebote(10 + i, 10, 30)));
    expect(max).toBeGreaterThan(1);
  });
});
