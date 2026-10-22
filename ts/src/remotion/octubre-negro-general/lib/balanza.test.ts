import { describe, expect, it } from 'vitest';

import { anguloBalanza, type PasoBalanza } from './balanza';

const pasos: PasoBalanza[] = [
  { frame: 100, grados: -14 },
  { frame: 160, grados: 14 },
  { frame: 220, grados: 0 },
];

describe('anguloBalanza', () => {
  it('está en 0 antes del primer paso', () => {
    expect(anguloBalanza(0, pasos)).toBe(0);
    expect(anguloBalanza(100, pasos)).toBe(0);
  });

  it('se inclina hacia el primer lado, rebasa su objetivo y se asienta', () => {
    const serie = Array.from({ length: 50 }, (_, k) => anguloBalanza(101 + k, pasos));
    expect(Math.min(...serie)).toBeLessThan(-14);
    expect(anguloBalanza(159, pasos)).toBeCloseTo(-14, 0);
  });

  it('cruza al lado contrario en el segundo paso', () => {
    expect(anguloBalanza(158, pasos)).toBeLessThan(0);
    expect(anguloBalanza(215, pasos)).toBeGreaterThan(10);
  });

  it('termina equilibrada en el centro', () => {
    expect(Math.abs(anguloBalanza(400, pasos))).toBeLessThan(0.05);
  });

  it('oscila con amplitud que decae al equilibrarse', () => {
    const amp = (a: number, b: number) =>
      Math.max(...Array.from({ length: b - a }, (_, k) => Math.abs(anguloBalanza(a + k, pasos))));
    expect(amp(222, 240)).toBeGreaterThan(amp(262, 280));
  });
});
