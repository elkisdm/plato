import { describe, expect, it } from 'vitest';

import {
  ABAJO_V,
  ANCHO_V,
  ARRIBA_V,
  fsMinimo,
  H_V,
  MARGEN_LATERAL,
  MARGEN_V,
  MIN_TEXTO_V,
  W_V,
  YFIN_ESCENA,
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

describe('márgenes fijos de la serie', () => {
  it('120 px en los lados y arriba', () => {
    expect(MARGEN_LATERAL).toBe(120);
    expect(MARGEN_V).toBe(120);
  });

  it('las escenas terminan en 1450, sobre la banda de subtítulos (1480–1640)', () => {
    expect(YFIN_ESCENA).toBe(1450);
    expect(YFIN_ESCENA).toBeLessThan(1480);
    expect(YFIN_ESCENA).toBeGreaterThan(YINI_V);
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
    expect(ANCHO_V).toBe(W_V - MARGEN_LATERAL * 2);
    expect(ANCHO_V).toBeGreaterThan(0);
  });
});
