/** Trazo a mano alzada (tachados, rayas): polilínea con vaivén determinista que se dibuja con dasharray. */

import { random } from 'remotion';

export type Trazo = { d: string; largo: number; puntos: { x: number; y: number }[] };

/** Recta de (x1,y1) a (x2,y2) con `n` puntos intermedios desviados hasta `amp` px en perpendicular. */
export function trazoOnduloso(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  semilla: string,
  n = 6,
  amp = 5,
): Trazo {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const puntos = Array.from({ length: n + 2 }, (_, k) => {
    if (k === 0) return { x: x1, y: y1 };
    if (k === n + 1) return { x: x2, y: y2 };
    const t = k / (n + 1);
    const off = (random(`${semilla}-${k}`) * 2 - 1) * amp;
    return { x: x1 + dx * t + nx * off, y: y1 + dy * t + ny * off };
  });
  const largo = puntos.reduce((s, p, k) => (k === 0 ? 0 : s + Math.hypot(p.x - puntos[k - 1]!.x, p.y - puntos[k - 1]!.y)), 0);
  const d = puntos.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return { d, largo, puntos };
}
