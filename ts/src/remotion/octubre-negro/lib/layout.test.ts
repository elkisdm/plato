import { describe, expect, it } from 'vitest';

import {
  ABAJO_V,
  ANCHO_V,
  ARRIBA_V,
  fsMinimo,
  H_V,
  MARGEN_V,
  MIN_TEXTO_V,
  W_V,
  YFIN_V,
  YINI_V,
} from './layout';

describe('fsMinimo', () => {
  it('sube a 28 px los textos chicos y respeta los grandes', () => {
    expect(MIN_TEXTO_V).toBe(28);
    expect(fsMinimo(20)).toBe(28);
    expect(fsMinimo(28)).toBe(28);
    expect(fsMinimo(54)).toBe(54);
  });
});

describe('zonas seguras de Instagram', () => {
  it('el contenido arranca bajo los 120 px superiores y termina sobre los 260 px inferiores', () => {
    expect(YINI_V).toBeGreaterThanOrEqual(ARRIBA_V);
    expect(YFIN_V).toBeLessThanOrEqual(H_V - ABAJO_V);
    expect(YFIN_V).toBeGreaterThan(YINI_V);
  });

  it('las zonas tapadas no se superponen con el contenido ni entre sí', () => {
    expect(ARRIBA_V).toBeLessThan(H_V - ABAJO_V);
    expect(ARRIBA_V).toBeLessThanOrEqual(YINI_V);
    expect(YFIN_V).toBeLessThanOrEqual(H_V - ABAJO_V);
  });

  it('el ancho útil es el lienzo menos los dos márgenes', () => {
    expect(ANCHO_V).toBe(W_V - MARGEN_V * 2);
    expect(ANCHO_V).toBeGreaterThan(0);
  });
});
