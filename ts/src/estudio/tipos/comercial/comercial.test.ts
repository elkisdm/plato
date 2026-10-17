import { describe, expect, it } from 'vitest';
import { curvaSuave, enOrbita, esquemas, puntosDeSerie } from './esquemas';

describe('curvaSuave', () => {
  it('parte en el primer punto y termina en el último', () => {
    const d = curvaSuave([
      [0, 100],
      [50, 20],
      [100, 60],
    ]);
    expect(d.startsWith('M 0 100')).toBe(true);
    expect(d.endsWith('100 60')).toBe(true);
  });
  it('un solo tramo por par de puntos consecutivos', () => {
    const d = curvaSuave([
      [0, 0],
      [10, 10],
      [20, 0],
      [30, 10],
    ]);
    expect(d.match(/C/g)).toHaveLength(3);
  });
});

describe('puntosDeSerie', () => {
  it('reparte la serie en el ancho y la invierte en el alto (1 arriba, 0 abajo)', () => {
    expect(puntosDeSerie([0, 1], 200, 100)).toEqual([
      [0, 100],
      [200, 0],
    ]);
  });
});

describe('enOrbita', () => {
  it('reparte n nodos en el círculo empezando arriba', () => {
    const [x, y] = enOrbita(0, 4, 100);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(-100);
    const [x1, y1] = enOrbita(1, 4, 100);
    expect(x1).toBeCloseTo(100);
    expect(y1).toBeCloseTo(0);
  });
});

describe('esquemas del tipo comercial', () => {
  it('la gráfica exige valores entre 0 y 1 (ilustrativos, sin cifras reales)', () => {
    expect(esquemas.grafica.safeParse({ serie: [0.2, 0.5, 0.9] }).success).toBe(true);
    expect(esquemas.grafica.safeParse({ serie: [12, 40, 80] }).success).toBe(false);
  });
  it('los canales llevan entre 2 y 4 nodos', () => {
    expect(esquemas.canales.safeParse({ canales: ['Llamada'] }).success).toBe(false);
    expect(esquemas.canales.safeParse({ canales: ['Llamada', 'WhatsApp', 'Correo'] }).success).toBe(
      true,
    );
  });
});
