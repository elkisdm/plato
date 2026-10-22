import { describe, expect, it } from 'vitest';

import {
  claseFicha,
  EXAGERADAS,
  MARGEN_LATERAL_FICHAS,
  posicionFicha,
  REALES,
  TOTAL_FICHAS,
  tamanoCuadricula,
} from './fichas27';

describe('cuadrícula de 27 fichas', () => {
  it('27 posiciones únicas dentro de los márgenes laterales de 120 px', () => {
    const ps = Array.from({ length: TOTAL_FICHAS }, (_, i) =>
      posicionFicha(i, MARGEN_LATERAL_FICHAS, 300),
    );
    expect(new Set(ps.map((p) => `${p.x},${p.y}`)).size).toBe(27);
    for (const p of ps) {
      expect(p.x).toBeGreaterThanOrEqual(120);
      expect(p.x + p.ancho).toBeLessThanOrEqual(1080 - 120);
    }
  });

  it('el tamaño total envuelve la última ficha y cabe en 840 px', () => {
    const { ancho, alto } = tamanoCuadricula();
    const ultima = posicionFicha(26, 0, 0);
    expect(ultima.y + ultima.alto).toBeLessThanOrEqual(alto);
    expect(ancho).toBeLessThanOrEqual(840);
  });

  it('lanza si el índice no existe', () => {
    expect(() => posicionFicha(27, 0, 0)).toThrow();
    expect(() => posicionFicha(-1, 0, 0)).toThrow();
  });
});

describe('clase de cada ficha', () => {
  it('reales y exageradas no se solapan y existen en la cuadrícula', () => {
    for (const i of [...REALES, ...EXAGERADAS]) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(TOTAL_FICHAS);
    }
    expect(REALES.filter((i) => EXAGERADAS.includes(i))).toEqual([]);
  });

  it('las exageradas están en columnas interiores: al hincharse no pasan de los márgenes', () => {
    for (const i of EXAGERADAS) {
      const p = posicionFicha(i, MARGEN_LATERAL_FICHAS, 0);
      const crece = p.ancho * 0.15;
      expect(p.x - crece).toBeGreaterThanOrEqual(120);
      expect(p.x + p.ancho + crece).toBeLessThanOrEqual(960);
    }
  });

  it('claseFicha clasifica real, exagerada y neutra', () => {
    expect(claseFicha(REALES[0]!)).toBe('real');
    expect(claseFicha(EXAGERADAS[0]!)).toBe('exagerada');
    const neutra = Array.from({ length: TOTAL_FICHAS }, (_, i) => i).find(
      (i) => !REALES.includes(i) && !EXAGERADAS.includes(i),
    )!;
    expect(claseFicha(neutra)).toBe('neutra');
  });
});
