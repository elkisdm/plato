import { describe, expect, it } from 'vitest';

import { PALABRAS, type Palabra } from './alineacion';
import { agruparFrases, FRASES } from './subtitulos';

const p = (texto: string, inicio: number, linea = 0): Palabra => ({
  texto,
  inicio,
  fin: inicio + 0.2,
  linea,
});

describe('agruparFrases', () => {
  it('corta tras puntuación cuando la frase ya tiene al menos 3 palabras', () => {
    const ps = [p('Uno', 0), p('dos', 1), p('tres,', 2), p('cuatro', 3), p('cinco', 4), p('seis', 5)];
    const f = agruparFrases(ps);
    expect(f.map((x) => x.texto)).toEqual(['Uno dos tres,', 'cuatro cinco seis']);
  });

  it('nunca pasa de 5 palabras', () => {
    const ps = Array.from({ length: 12 }, (_, i) => p(`w${i}`, i));
    const f = agruparFrases(ps);
    expect(f.every((x) => x.palabras.length <= 5)).toBe(true);
    expect(f.flatMap((x) => x.palabras)).toHaveLength(12);
  });

  it('no cruza el límite de línea', () => {
    const ps = [p('a', 0, 0), p('b', 1, 0), p('c', 2, 1), p('d', 3, 1), p('e', 4, 1)];
    const f = agruparFrases(ps);
    f.forEach((x) => expect(new Set(x.palabras.map((w) => w.linea)).size).toBe(1));
  });

  it('inicio y fin salen de la primera y la última palabra', () => {
    const [f] = agruparFrases([p('a', 1), p('b', 2), p('c', 3)]);
    expect(f!.inicio).toBe(1);
    expect(f!.fin).toBeCloseTo(3.2);
  });

  it('evita dejar una frase huérfana de 1 palabra al final de la línea', () => {
    const ps = Array.from({ length: 6 }, (_, i) => p(`w${i}`, i));
    const f = agruparFrases(ps);
    expect(f.every((x) => x.palabras.length >= 2)).toBe(true);
  });
});

describe('FRASES reales', () => {
  it('cubren todas las palabras del guion en orden', () => {
    expect(FRASES.flatMap((f) => f.palabras)).toEqual(PALABRAS);
  });

  it('todas tienen entre 3 y 5 palabras salvo cola de línea corta (mínimo 2)', () => {
    FRASES.forEach((f) => {
      expect(f.palabras.length).toBeGreaterThanOrEqual(2);
      expect(f.palabras.length).toBeLessThanOrEqual(5);
    });
  });
});
