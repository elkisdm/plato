/** Partículas deterministas de las escenas finales: chispas (ráfaga desde un punto) y motas (polvo flotando). */

import { random } from 'remotion';

export type Chispa = { angulo: number; velocidad: number; radio: number; vida: number };

/** `n` chispas repartidas por todo el círculo (con un poco de ruido) para una ráfaga. */
export function crearChispas(n: number, semilla: string): Chispa[] {
  return Array.from({ length: n }, (_, i) => {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    return {
      angulo: ((i + r('a') * 0.8) / n) * Math.PI * 2,
      velocidad: 5 + r('v') * 11,
      radio: 3 + r('r') * 5,
      vida: 18 + Math.round(r('l') * 16),
    };
  });
}

/** Posición relativa al origen de la ráfaga `dt` frames después de nacer; null si aún no nace o ya se apagó. */
export function posicionChispa(
  c: Chispa,
  dt: number,
): { x: number; y: number; alfa: number; escala: number } | null {
  if (dt < 0 || dt >= c.vida) return null;
  // Frena como si tuviera rozamiento: distancia = v·τ·(1 − e^(−dt/τ)); cae un poco por gravedad.
  const tau = 8;
  const d = c.velocidad * tau * (1 - Math.exp(-dt / tau));
  const p = dt / c.vida;
  return {
    x: Math.cos(c.angulo) * d,
    y: Math.sin(c.angulo) * d + 0.05 * dt * dt,
    alfa: Math.pow(1 - p, 1.4),
    escala: 1 - 0.6 * p,
  };
}

export type Mota = {
  x0: number;
  y0: number;
  radio: number;
  /** px por frame; positivo = baja, negativo = sube. */
  velocidad: number;
  fase: number;
  deriva: number;
};

export function crearMotas(n: number, semilla: string, ancho: number, alto: number): Mota[] {
  return Array.from({ length: n }, (_, i) => {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    return {
      x0: r('x') * ancho,
      y0: r('y') * alto,
      radio: 2 + r('r') * r('r') * 6,
      velocidad: (r('s') < 0.5 ? -1 : 1) * (0.2 + r('v') * 0.6),
      fase: r('f') * Math.PI * 2,
      deriva: 6 + r('d') * 22,
    };
  });
}

/** Mota a la deriva dentro del recuadro `ancho`×`alto`: recorre en vertical con vaivén y titila. */
export function posicionMota(
  m: Mota,
  frame: number,
  ancho: number,
  alto: number,
): { x: number; y: number; alfa: number } {
  const y = (((m.y0 + m.velocidad * frame) % alto) + alto) % alto;
  const x = Math.min(ancho, Math.max(0, m.x0 + m.deriva * Math.sin(frame * 0.02 + m.fase)));
  const borde = Math.min(1, y / 120, (alto - y) / 120);
  const titileo = 0.55 + 0.45 * Math.sin(frame * 0.07 + m.fase * 3);
  return { x, y, alfa: Math.max(0, Math.min(1, borde * titileo)) };
}
