import { describe, expect, it } from 'vitest';

import { temblor } from './glitch';

describe('temblor', () => {
  it('no hay temblor antes del golpe', () => {
    expect(temblor(99, 100, 3)).toEqual({ dx: 0, dy: 0, rot: 0, corte: 0 });
  });

  it('empieza fuerte y baja de amplitud con el tiempo', () => {
    const mag = (f: number) => {
      let m = 0;
      for (let k = 0; k < 6; k++) {
        const t = temblor(f + k, 100, 3);
        m = Math.max(m, Math.abs(t.dx), Math.abs(t.dy));
      }
      return m;
    };
    expect(mag(100)).toBeGreaterThan(mag(130));
  });

  it('nunca se queda quieto del todo: sigue un leve temblor mucho después', () => {
    const algo = Array.from({ length: 20 }, (_, k) => temblor(300 + k, 100, 3)).some((t) => t.dx !== 0 || t.dy !== 0);
    expect(algo).toBe(true);
  });

  it('es determinista, acotado y cada ficha tiembla distinto', () => {
    expect(temblor(110, 100, 3)).toEqual(temblor(110, 100, 3));
    const t = temblor(101, 100, 3);
    expect(Math.abs(t.dx)).toBeLessThanOrEqual(9);
    expect(Math.abs(t.dy)).toBeLessThanOrEqual(9);
    expect(temblor(104, 100, 3)).not.toEqual(temblor(104, 100, 4));
  });

  it('el corte de glitch (px) aparece solo a ratos', () => {
    const cortes = Array.from({ length: 40 }, (_, k) => temblor(100 + k, 100, 3).corte);
    expect(cortes.some((c) => c !== 0)).toBe(true);
    expect(cortes.some((c) => c === 0)).toBe(true);
  });
});
