import { describe, expect, it } from 'vitest';
import { cuadrosDesde, empuje } from '../../kit/identidad/video';
import { fondoDeEscena } from './fondo';

describe('cuadrosDesde', () => {
  it('lleva segundos a cuadros reales de la composición', () => {
    expect(cuadrosDesde(0, 30)).toBe(0);
    expect(cuadrosDesde(2.5, 30)).toBe(75);
    expect(cuadrosDesde(2.5, 60)).toBe(150);
    expect(cuadrosDesde(0.016, 30)).toBe(0);
  });
});

describe('empuje', () => {
  it('va de 1,00 a 1,06 a lo largo de la escena y no se sale del rango', () => {
    expect(empuje(0)).toBe(1);
    expect(empuje(0.5)).toBeCloseTo(1.03);
    expect(empuje(1)).toBeCloseTo(1.06);
    expect(empuje(-1)).toBe(1);
    expect(empuje(3)).toBeCloseTo(1.06);
  });
});

describe('fondoDeEscena', () => {
  const fondo = { video: 'x/y', desde: 1, velo: 'fuerte' as const, velocidad: 1 };
  it('devuelve el fondo cuando la escena lo trae: el envoltorio dibuja VideoViva', () => {
    expect(fondoDeEscena({ fondo })).toBe(fondo);
  });
  it('devuelve null sin `fondo`: la escena usa el fondo del tipo', () => {
    expect(fondoDeEscena({})).toBeNull();
    expect(fondoDeEscena({ fondo: undefined })).toBeNull();
  });
});
