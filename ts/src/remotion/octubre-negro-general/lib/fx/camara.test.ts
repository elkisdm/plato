import { describe, expect, it } from 'vitest';

import { DURACION, ESCENAS } from '../lineaTiempo';
import { decaimiento, escalaEmpuje, shakeGolpes, transformCamara } from './camara';
import { GOLPES_CAMARA } from './golpes';

describe('decaimiento', () => {
  it('es 0 antes del golpe, 1 en el golpe y baja de forma monótona', () => {
    expect(decaimiento(-1)).toBe(0);
    expect(decaimiento(0)).toBe(1);
    let prev = 1;
    for (let dt = 1; dt <= 12; dt++) {
      const d = decaimiento(dt);
      expect(d).toBeLessThan(prev);
      prev = d;
    }
  });

  it('se apaga del todo en ~10 frames (<8 % a los 9, 0 pasados 12)', () => {
    expect(decaimiento(9)).toBeLessThan(0.08);
    expect(decaimiento(13)).toBe(0);
  });
});

describe('shakeGolpes', () => {
  const golpes = [{ frame: 100, fuerza: 1 }];

  it('sin golpe cerca es cero', () => {
    expect(shakeGolpes(50, golpes)).toEqual({ x: 0, y: 0, rot: 0, zoom: 0 });
    expect(shakeGolpes(120, golpes)).toEqual({ x: 0, y: 0, rot: 0, zoom: 0 });
  });

  it('es determinista', () => {
    expect(shakeGolpes(102, golpes)).toEqual(shakeGolpes(102, golpes));
  });

  it('el golpe da la amplitud máxima en su frame y decae después', () => {
    const mag = (f: number) => {
      const s = shakeGolpes(f, golpes);
      return Math.hypot(s.x, s.y);
    };
    expect(mag(100)).toBeGreaterThan(8);
    expect(mag(100)).toBeLessThanOrEqual(20);
    expect(mag(108)).toBeLessThan(mag(100) * 0.3);
  });

  it('la fuerza escala la amplitud y el zoom de golpe es positivo', () => {
    const fuerte = shakeGolpes(100, [{ frame: 100, fuerza: 1 }]);
    const suave = shakeGolpes(100, [{ frame: 100, fuerza: 0.4 }]);
    expect(Math.hypot(suave.x, suave.y)).toBeCloseTo(Math.hypot(fuerte.x, fuerte.y) * 0.4, 5);
    expect(fuerte.zoom).toBeGreaterThan(0);
  });
});

describe('escalaEmpuje', () => {
  it('arranca en 1.00 y nunca supera 1.05', () => {
    expect(escalaEmpuje(0)).toBeCloseTo(1, 6);
    for (let f = 0; f < DURACION; f++) {
      expect(escalaEmpuje(f)).toBeGreaterThanOrEqual(1 - 1e-9);
      expect(escalaEmpuje(f)).toBeLessThanOrEqual(1.05 + 1e-9);
    }
  });

  it('crece dentro de cada escena y es continuo (sin saltos) en las transiciones', () => {
    for (let f = 1; f < DURACION; f++) {
      expect(Math.abs(escalaEmpuje(f) - escalaEmpuje(f - 1))).toBeLessThan(0.006);
    }
    const e = ESCENAS[2]!;
    expect(escalaEmpuje(e.hasta - 20)).toBeGreaterThan(escalaEmpuje(e.desde + 20));
  });
});

describe('transformCamara', () => {
  it('nunca supera escala 1.06 y mantiene x 120–960 dentro del lienzo', () => {
    for (let f = 0; f < DURACION; f++) {
      const t = transformCamara(f, ESCENAS, GOLPES_CAMARA);
      expect(t.scale).toBeLessThanOrEqual(1.06 + 1e-9);
      expect(t.scale).toBeGreaterThanOrEqual(1 - 1e-9);
      const xIzq = 540 + (120 - 540) * t.scale + t.x;
      const xDer = 540 + (960 - 540) * t.scale + t.x;
      expect(xIzq).toBeGreaterThan(40);
      expect(xDer).toBeLessThan(1040);
    }
  });

  it('el shake nunca pasa de 24 px ni de 1° de giro', () => {
    for (let f = 0; f < DURACION; f++) {
      const t = transformCamara(f, ESCENAS, GOLPES_CAMARA);
      expect(Math.abs(t.x)).toBeLessThanOrEqual(24);
      expect(Math.abs(t.y)).toBeLessThanOrEqual(24);
      expect(Math.abs(t.rot)).toBeLessThanOrEqual(1);
    }
  });
});
