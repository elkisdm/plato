import { describe, expect, it } from 'vitest';

import { posicionRodillo, velocidadRodillo } from './rodillo';

describe('posicionRodillo', () => {
  const ini = 6;
  const aterriza = 55;
  const total = 37;

  it('está en 0 antes de empezar', () => {
    expect(posicionRodillo(0, ini, aterriza, total)).toBe(0);
    expect(posicionRodillo(ini, ini, aterriza, total)).toBe(0);
  });

  it('llega exactamente a `total` en el cuadro de aterrizaje', () => {
    expect(posicionRodillo(aterriza, ini, aterriza, total)).toBeCloseTo(total, 5);
  });

  it('no retrocede mientras gira y frena al acercarse', () => {
    let previo = 0;
    for (let f = ini; f <= aterriza; f++) {
      const p = posicionRodillo(f, ini, aterriza, total);
      expect(p).toBeGreaterThanOrEqual(previo);
      previo = p;
    }
    expect(velocidadRodillo(ini + 2, ini, aterriza, total)).toBeGreaterThan(
      velocidadRodillo(aterriza - 3, ini, aterriza, total),
    );
  });

  it('rebasa un poco al aterrizar (overshoot) y se asienta sin ruido', () => {
    const despues = Array.from({ length: 12 }, (_, k) => posicionRodillo(aterriza + k, ini, aterriza, total));
    expect(Math.max(...despues)).toBeGreaterThan(total + 0.05);
    expect(posicionRodillo(aterriza + 40, ini, aterriza, total)).toBe(total);
  });

  it('es determinista', () => {
    expect(posicionRodillo(30, ini, aterriza, total)).toBe(posicionRodillo(30, ini, aterriza, total));
  });
});

describe('velocidadRodillo', () => {
  it('es 0 fuera del giro y positiva mientras gira', () => {
    expect(velocidadRodillo(0, 6, 55, 37)).toBe(0);
    expect(velocidadRodillo(20, 6, 55, 37)).toBeGreaterThan(0);
    expect(velocidadRodillo(200, 6, 55, 37)).toBe(0);
  });
});
