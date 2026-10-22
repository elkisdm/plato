/** Progresos y easings puros reutilizables. */

import { spring } from 'remotion';

import { SPRINGS } from '../constants/theme';

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** 0→1 con easeOutCubic desde `inicioFrame`, en `duracion` frames; clamp. */
export function entrada(frame: number, inicioFrame: number, duracion = 12): number {
  return easeOutCubic(clamp01((frame - inicioFrame) / duracion));
}

/** Spring con overshoot corto (`SPRINGS.golpe`). 0 antes de `inicioFrame`. */
export function rebote(frame: number, inicioFrame: number, fps: number): number {
  return spring({ frame: frame - inicioFrame, fps, config: SPRINGS.golpe });
}

/** 0→1 lineal entre los frames `a` y `b`; clamp. */
export function entre(frame: number, a: number, b: number): number {
  return clamp01((frame - a) / (b - a));
}
