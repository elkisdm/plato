/**
 * Primitivas de tiempo puras: todo depende del frame, nada de CSS animations.
 */

import { Easing, interpolate } from 'remotion';

/** Curva por defecto: aceleración natural, llegada suave, sin rebote. */
export const EASE = Easing.bezier(0.45, 0, 0.15, 1);

/** Progreso 0..1 de una ventana [start, start + duration], sujeto fuera de ella. */
export function progress(
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE,
): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

/** Fracción lineal de un viaje (pulso por una línea) o null si no está en curso. */
export function travel(frame: number, start: number, duration: number): number | null {
  if (frame < start || frame > start + duration) return null;
  return (frame - start) / duration;
}

export interface CameraPose {
  /** Punto del mundo que queda en el centro del canvas. */
  x: number;
  y: number;
  zoom: number;
}

export interface CameraKey extends CameraPose {
  frame: number;
}

/** Pose de cámara interpolada entre keyframes con la curva por defecto. */
export function cameraAt(frame: number, keys: CameraKey[]): CameraPose {
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (frame <= first.frame) return { x: first.x, y: first.y, zoom: first.zoom };
  if (frame >= last.frame) return { x: last.x, y: last.y, zoom: last.zoom };
  let i = 1;
  while (keys[i]!.frame < frame) i++;
  const a = keys[i - 1]!;
  const b = keys[i]!;
  const t = progress(frame, a.frame, b.frame - a.frame);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    zoom: a.zoom + (b.zoom - a.zoom) * t,
  };
}
