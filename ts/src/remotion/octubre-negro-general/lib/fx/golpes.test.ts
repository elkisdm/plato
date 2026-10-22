import { describe, expect, it } from 'vitest';

import { DURACION } from '../lineaTiempo';
import { GOLPES_CAMARA } from './golpes';

describe('GOLPES_CAMARA', () => {
  it('tiene al menos un golpe por escena (7)', () => {
    expect(GOLPES_CAMARA.length).toBeGreaterThanOrEqual(7);
  });

  it('cada golpe cae dentro de la composición con fuerza entre 0 y 1', () => {
    GOLPES_CAMARA.forEach((g) => {
      expect(Number.isInteger(g.frame)).toBe(true);
      expect(g.frame).toBeGreaterThanOrEqual(0);
      expect(g.frame).toBeLessThan(DURACION);
      expect(g.fuerza).toBeGreaterThan(0);
      expect(g.fuerza).toBeLessThanOrEqual(1);
    });
  });

  it('un punto de choque opcional queda dentro del lienzo', () => {
    GOLPES_CAMARA.forEach((g) => {
      if (g.x !== undefined) expect(g.x).toBeGreaterThanOrEqual(0);
      if (g.x !== undefined) expect(g.x).toBeLessThanOrEqual(1080);
      if (g.y !== undefined) expect(g.y).toBeGreaterThanOrEqual(0);
      if (g.y !== undefined) expect(g.y).toBeLessThanOrEqual(1920);
    });
  });
});
