/** Ascuas del fondo: parámetros deterministas (`random` de Remotion) y posición por frame. */

import { random } from 'remotion';

export type Particula = {
  x0: number;
  y0: number;
  radio: number;
  /** px por frame hacia arriba. */
  velocidad: number;
  fase: number;
  /** Amplitud (px) y frecuencia del vaivén lateral. */
  deriva: number;
  freq: number;
};

/** Alto del recorrido vertical: lienzo + 100 px por arriba y por abajo, para que entren y salgan sin pop. */
const RECORRIDO = 2120;

export function crearParticulas(cantidad: number, semilla: string): Particula[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    return {
      x0: r('x') * 1080,
      y0: r('y') * RECORRIDO,
      radio: 1 + r('r') * r('r') * 4,
      velocidad: 0.25 + r('v') * 0.9,
      fase: r('f') * Math.PI * 2,
      deriva: 8 + r('d') * 32,
      freq: 0.01 + r('q') * 0.02,
    };
  });
}

export type PosicionParticula = { x: number; y: number; alfa: number };

/** Sube y se reinicia por abajo; titila suave. y en [-100, 2020]. */
export function posicionParticula(p: Particula, frame: number): PosicionParticula {
  const y = (((p.y0 - p.velocidad * frame) % RECORRIDO) + RECORRIDO) % RECORRIDO - 100;
  const x = p.x0 + p.deriva * Math.sin(frame * p.freq + p.fase);
  const borde = Math.min(1, (y + 100) / 200, (2020 - y) / 200);
  const titileo = 0.55 + 0.45 * Math.sin(frame * 0.09 + p.fase * 3);
  return { x, y, alfa: Math.max(0, Math.min(1, borde * titileo)) };
}
