import { describe, expect, it } from 'vitest';

import { aFrame, palabra } from '../alineacion';
import { ESCENAS } from '../lineaTiempo';
import { animoEn, pesosAnimo } from './animo';

const enEscena = (i: number, delta = 40) => ESCENAS[i]!.desde + delta;

describe('animoEn', () => {
  it('asigna el ánimo base de cada escena', () => {
    expect(animoEn(enEscena(0))).toBe('alerta');
    expect(animoEn(enEscena(1))).toBe('alerta');
    expect(animoEn(enEscena(2))).toBe('neutro');
    expect(animoEn(enEscena(5))).toBe('calma');
    expect(animoEn(enEscena(6))).toBe('calma');
  });

  it('E04 pasa de alerta a calma al decir «cambiar tus llaves»', () => {
    const corte = aFrame(palabra('cambiar', 3).inicio);
    expect(animoEn(enEscena(3))).toBe('alerta');
    expect(animoEn(corte - 1)).toBe('alerta');
    expect(animoEn(corte)).toBe('calma');
  });

  it('E05 pasa de alerta a calma al decir «cierra»', () => {
    const corte = aFrame(palabra('cierra', 4).inicio);
    expect(animoEn(enEscena(4))).toBe('alerta');
    expect(animoEn(corte - 1)).toBe('alerta');
    expect(animoEn(corte)).toBe('calma');
  });
});

describe('pesosAnimo', () => {
  it('suma 1 en todos los frames y es 1 puro con el ánimo asentado', () => {
    for (let f = 0; f < 1834; f += 7) {
      const p = pesosAnimo(f);
      expect(p.alerta + p.calma + p.neutro).toBeCloseTo(1, 6);
    }
    expect(pesosAnimo(enEscena(0, 5)).alerta).toBe(1);
    expect(pesosAnimo(enEscena(6, 60)).calma).toBe(1);
  });

  it('mezcla de forma continua al cambiar de ánimo', () => {
    const corte = aFrame(palabra('cierra', 4).inicio);
    const antes = pesosAnimo(corte - 1);
    const medio = pesosAnimo(corte + 8);
    const despues = pesosAnimo(corte + 60);
    expect(antes.alerta).toBe(1);
    expect(medio.alerta).toBeGreaterThan(0);
    expect(medio.calma).toBeGreaterThan(0);
    expect(despues.calma).toBe(1);
  });
});
