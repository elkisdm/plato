import { describe, expect, it } from 'vitest';

import onda from '../data/onda.json';
import { PALABRAS, aFrame } from './alineacion';
import { DURACION, ESCENAS, SOLAPE } from './lineaTiempo';

describe('ESCENAS', () => {
  it('son 7 y la primera empieza en 0', () => {
    expect(ESCENAS).toHaveLength(7);
    expect(ESCENAS[0]!.desde).toBe(0);
  });

  it('cada escena apunta a su línea (n ↔ n−1)', () => {
    ESCENAS.forEach((e, i) => expect(e.linea).toBe(i));
  });

  it('se solapan: hasta > desde de la siguiente, y desde crece', () => {
    for (let i = 0; i < ESCENAS.length - 1; i++) {
      expect(ESCENAS[i]!.hasta).toBeGreaterThan(ESCENAS[i + 1]!.desde);
      expect(ESCENAS[i + 1]!.desde).toBeGreaterThan(ESCENAS[i]!.desde);
      expect(ESCENAS[i]!.hasta).toBeGreaterThan(ESCENAS[i]!.desde);
    }
  });

  it('la última termina en DURACION', () => {
    expect(ESCENAS[ESCENAS.length - 1]!.hasta).toBe(DURACION);
  });
});

describe('DURACION', () => {
  it('cubre el audio (onda.json) más el cierre', () => {
    expect(DURACION).toBeGreaterThanOrEqual(onda.length);
    expect(DURACION).toBe(aFrame(PALABRAS[PALABRAS.length - 1]!.fin) + 75);
  });

  it('son 1834 frames (61,1 s)', () => {
    expect(DURACION).toBe(1834);
  });
});

describe('SOLAPE', () => {
  it('las escenas contiguas se solapan 14 frames (ventana de la transición)', () => {
    for (let i = 0; i < ESCENAS.length - 1; i++) {
      expect(ESCENAS[i]!.hasta - ESCENAS[i + 1]!.desde).toBe(SOLAPE);
    }
  });
});
