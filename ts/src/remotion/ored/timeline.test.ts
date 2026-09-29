import { describe, expect, it } from 'vitest';

import {
  compilarLinea,
  duracionTotalFrames,
  ESCENAS_ORED,
  FPS_ORED,
  subtitulosDeEscena,
} from './timeline';

describe('timeline ORED', () => {
  it('las escenas arrancan una detrás de otra, sin huecos ni solapes', () => {
    const linea = compilarLinea(ESCENAS_ORED);
    expect(linea[0]!.desdeFrame).toBe(0);
    for (let i = 1; i < linea.length; i++) {
      const previo = linea[i - 1]!;
      expect(linea[i]!.desdeFrame).toBe(previo.desdeFrame + previo.duracionFrames);
    }
  });

  it('la duración total es la suma exacta de las escenas', () => {
    const linea = compilarLinea(ESCENAS_ORED);
    const suma = linea.reduce((acc, t) => acc + t.duracionFrames, 0);
    expect(duracionTotalFrames(ESCENAS_ORED)).toBe(suma);
  });

  it('el corte completo dura entre 1:55 y 2:15 — el target del tratamiento', () => {
    const total = duracionTotalFrames(ESCENAS_ORED) / FPS_ORED;
    expect(total).toBeGreaterThanOrEqual(115);
    expect(total).toBeLessThanOrEqual(135);
  });

  it('el rate de un clip nunca acelera el metraje (max 1) ni baja de 0.5', () => {
    for (const tramo of compilarLinea(ESCENAS_ORED)) {
      if (tramo.escena.clip === null) continue;
      expect(tramo.rate).toBeLessThanOrEqual(1);
      expect(tramo.rate).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('los subtítulos cubren el tramo del VO en orden y caben en pantalla', () => {
    for (const escena of ESCENAS_ORED) {
      if (escena.vo === null) continue;
      const subs = subtitulosDeEscena(escena);
      expect(subs.length).toBeGreaterThan(0);
      const primerFrame = Math.round(escena.voDesde * FPS_ORED);
      expect(subs[0]!.desdeFrame).toBe(primerFrame);
      for (let i = 1; i < subs.length; i++) {
        expect(subs[i]!.desdeFrame).toBe(subs[i - 1]!.hastaFrame);
      }
      for (const s of subs) {
        expect(s.texto.length).toBeLessThanOrEqual(58);
        expect(s.hastaFrame).toBeGreaterThan(s.desdeFrame);
      }
    }
  });

  it('la escena del agente reserva colchón de silencio tras el VO (el momento clave)', () => {
    const agente = ESCENAS_ORED.find((e) => e.id === 'agente');
    expect(agente).toBeDefined();
    expect(agente!.colchon).toBeGreaterThanOrEqual(2);
  });
});
