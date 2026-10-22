import { describe, expect, it } from 'vitest';

import { estadoLetra, estadoOnda, estadoSello, intensidadDestello, FRAME_IMPACTO_SELLO } from './efectos';

describe('intensidadDestello', () => {
  it('0 fuera de la ventana, pico ≤ 1 casi al inicio y cae a 0 dentro de 6 frames', () => {
    expect(intensidadDestello(-1, 6)).toBe(0);
    expect(intensidadDestello(6, 6)).toBe(0);
    expect(intensidadDestello(1, 6)).toBe(1);
    let prev = 1;
    for (let dt = 2; dt < 6; dt++) {
      const v = intensidadDestello(dt, 6);
      expect(v).toBeLessThan(prev);
      prev = v;
    }
  });
});

describe('estadoOnda', () => {
  it('es null fuera de la ventana', () => {
    expect(estadoOnda(-1, 18)).toBeNull();
    expect(estadoOnda(18, 18)).toBeNull();
  });

  it('el radio crece, la opacidad y el grosor bajan', () => {
    let prev = estadoOnda(0, 18)!;
    expect(prev.radio).toBeLessThan(0.2);
    for (let dt = 1; dt < 18; dt++) {
      const e = estadoOnda(dt, 18)!;
      expect(e.radio).toBeGreaterThan(prev.radio);
      expect(e.opacidad).toBeLessThanOrEqual(prev.opacidad);
      expect(e.grosor).toBeLessThanOrEqual(prev.grosor);
      prev = e;
    }
    expect(prev.radio).toBeGreaterThan(0.9);
    expect(prev.opacidad).toBeLessThan(0.2);
  });
});

describe('estadoLetra', () => {
  const f = 30;
  it('invisible y arriba antes de su turno', () => {
    const e = estadoLetra(10, 10, 3, 2, f);
    expect(e.opacity).toBe(0);
    expect(e.y).toBeLessThan(0);
  });

  it('cada letra entra un escalón después de la anterior', () => {
    const a = estadoLetra(14, 10, 0, 2, f);
    const b = estadoLetra(14, 10, 3, 2, f);
    expect(a.opacity).toBeGreaterThan(b.opacity);
  });

  it('rebota (pasa de su sitio) y se asienta en 0', () => {
    let pasa = false;
    for (let t = 0; t < 40; t++) if (estadoLetra(10 + t, 10, 0, 2, f).y > 0.5) pasa = true;
    expect(pasa).toBe(true);
    const fin = estadoLetra(10 + 90, 10, 0, 2, f);
    expect(fin.y).toBeCloseTo(0, 1);
    expect(fin.rot).toBeCloseTo(0, 1);
    expect(fin.opacity).toBe(1);
    expect(fin.blur).toBe(0);
  });

  it('es determinista', () => {
    expect(estadoLetra(17, 10, 2, 2, f)).toEqual(estadoLetra(17, 10, 2, 2, f));
  });
});

describe('estadoSello', () => {
  it('invisible antes del inicio', () => {
    expect(estadoSello(9, 10, -8).opacity).toBe(0);
  });

  it('cae grande y girado, golpea a escala 1 y rebota hasta asentarse', () => {
    const caida = estadoSello(10, 10, -8);
    expect(caida.scale).toBeGreaterThan(2);
    expect(caida.opacity).toBeGreaterThan(0);
    const golpe = estadoSello(10 + FRAME_IMPACTO_SELLO, 10, -8);
    expect(golpe.scale).toBeCloseTo(1, 1);
    let sobre = false;
    for (let t = FRAME_IMPACTO_SELLO; t < FRAME_IMPACTO_SELLO + 12; t++) {
      if (estadoSello(10 + t, 10, -8).scale > 1.03 || estadoSello(10 + t, 10, -8).scale < 0.97) sobre = true;
    }
    expect(sobre).toBe(true);
    const fin = estadoSello(10 + 90, 10, -8);
    expect(fin.scale).toBeCloseTo(1, 2);
    expect(fin.rot).toBeCloseTo(-8, 1);
    expect(fin.opacity).toBe(1);
  });
});
