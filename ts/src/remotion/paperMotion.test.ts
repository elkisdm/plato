import { describe, expect, it } from 'vitest';

import {
  enterOpacityAt,
  liftProgressAt,
  microAt,
  scaleAt,
  shadowAt,
  wordOpacityAt,
} from './paperMotion';
import type { LifeConfig, LiftConfig } from './paperMotion';

const LIFT: LiftConfig = { target: 0.82, durationInFrames: 27, easing: 'out-cubic' };

const LIFE: LifeConfig = {
  amplitude: 0.65,
  bobHz: 0.33,
  tiltHz: 0.22,
  leanHz: 0.43,
  bobPx: 4,
  tiltDeg: 2,
  leanDeg: 1.4,
};

describe('liftProgressAt', () => {
  it('vale 0 antes de enterAt y en enterAt (clamp izquierdo)', () => {
    expect(liftProgressAt(0, 12, LIFT)).toBe(0);
    expect(liftProgressAt(11, 12, LIFT)).toBe(0);
    expect(liftProgressAt(12, 12, LIFT)).toBe(0);
  });

  it('alcanza target al final del despegue y se queda ahí (clamp derecho)', () => {
    expect(liftProgressAt(12 + 27, 12, LIFT)).toBeCloseTo(0.82, 10);
    expect(liftProgressAt(500, 12, LIFT)).toBeCloseTo(0.82, 10);
  });

  it('con easing linear el punto medio es exactamente la mitad del target', () => {
    const linear: LiftConfig = { target: 0.8, durationInFrames: 20, easing: 'linear' };
    expect(liftProgressAt(10, 0, linear)).toBeCloseTo(0.4, 10);
  });

  it('out-cubic adelanta al lineal en el punto medio (perfil ease-out)', () => {
    const cubic = liftProgressAt(12 + 13, 12, LIFT);
    const linearMid = (13 / 27) * LIFT.target;
    expect(cubic).toBeGreaterThan(linearMid);
  });

  it('es monótona no-decreciente durante el despegue', () => {
    let prev = -1;
    for (let f = 12; f <= 12 + 27; f++) {
      const lp = liftProgressAt(f, 12, LIFT);
      expect(lp).toBeGreaterThanOrEqual(prev);
      prev = lp;
    }
  });
});

describe('shadowAt', () => {
  it('en reposo (lift 0): sombra pegada al papel', () => {
    expect(shadowAt(0)).toEqual({ dx: 0, dy: 4, blur: 1, opacity: 0.16 });
  });

  it('despegado (lift 0.82): la sombra crece en offset, blur y opacidad', () => {
    const s = shadowAt(0.82);
    expect(s.dx).toBeCloseTo(7.38, 10);
    expect(s.dy).toBeCloseTo(20.4, 10);
    expect(s.blur).toBeCloseTo(14.94, 10);
    expect(s.opacity).toBeCloseTo(0.3896, 10);
  });
});

describe('scaleAt', () => {
  it('escala 1 en reposo y 1 + 0.09·lift despegado', () => {
    expect(scaleAt(0)).toBe(1);
    expect(scaleAt(0.82)).toBeCloseTo(1.0738, 10);
  });
});

describe('microAt', () => {
  it('antes de enterAt todo es 0 (gate)', () => {
    expect(microAt(5, 12, 30, LIFE)).toEqual({ bob: 0, tilt: 0, lean: 0 });
  });

  it('amplitude 0 deja el recorte totalmente quieto', () => {
    const still = { ...LIFE, amplitude: 0 };
    expect(microAt(100, 12, 30, still)).toEqual({ bob: 0, tilt: 0, lean: 0 });
  });

  it('bob alcanza su pico bobPx·amplitude en el cuarto de período', () => {
    // bobHz 1 a 20 fps → período 20 frames → pico del seno en frame enterAt+5
    const life = { ...LIFE, bobHz: 1, amplitude: 1 };
    const m = microAt(5, 0, 20, life);
    expect(m.bob).toBeCloseTo(LIFE.bobPx, 10);
  });

  it('tilt es sinusoidal: vale 0 en tSec=0 y -pico en 3/4 de período', () => {
    const life = { ...LIFE, tiltHz: 1, amplitude: 1 };
    expect(microAt(0, 0, 20, life).tilt).toBeCloseTo(0, 10);
    expect(microAt(15, 0, 20, life).tilt).toBeCloseTo(-LIFE.tiltDeg, 10);
  });

  it('lean lleva fase +1 (no arranca en 0)', () => {
    const life = { ...LIFE, amplitude: 1 };
    const m = microAt(0, 0, 30, life);
    expect(m.lean).toBeCloseTo(Math.sin(1) * LIFE.leanDeg, 10);
  });

  it('es determinístico: mismos argumentos → mismo resultado', () => {
    expect(microAt(42, 12, 30, LIFE)).toEqual(microAt(42, 12, 30, LIFE));
  });
});

describe('enterOpacityAt', () => {
  it('invisible antes de enterAt, fade lineal, 1 al completar', () => {
    expect(enterOpacityAt(0, 12, 8)).toBe(0);
    expect(enterOpacityAt(12, 12, 8)).toBe(0);
    expect(enterOpacityAt(16, 12, 8)).toBeCloseTo(0.5, 10);
    expect(enterOpacityAt(20, 12, 8)).toBe(1);
    expect(enterOpacityAt(999, 12, 8)).toBe(1);
  });
});

describe('wordOpacityAt', () => {
  it('la palabra i arranca su fade en enterAt + i·wordFadeFrames (append)', () => {
    // línea entra en 8, fade de 3 frames por palabra
    expect(wordOpacityAt(8, 8, 0, 3)).toBe(0);
    expect(wordOpacityAt(11, 8, 0, 3)).toBe(1);
    // palabra 2 recién arranca en frame 8 + 2*3 = 14
    expect(wordOpacityAt(13, 8, 2, 3)).toBe(0);
    expect(wordOpacityAt(14, 8, 2, 3)).toBe(0);
    expect(wordOpacityAt(17, 8, 2, 3)).toBe(1);
  });

  it('clamp en [0,1] siempre', () => {
    expect(wordOpacityAt(-50, 8, 1, 3)).toBe(0);
    expect(wordOpacityAt(5000, 8, 1, 3)).toBe(1);
  });
});
