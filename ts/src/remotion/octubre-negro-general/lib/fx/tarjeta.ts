/** Inclinación 3D de `TarjetaProfunda`: respira sola y reacciona al shake de la cámara. Tope 8° por eje. */

import { shakeGolpes } from './camara';
import { GOLPES_CAMARA, type Golpe } from './golpes';

export const INCLINACION_MAX = 8;

const tope = (g: number): number => Math.max(-INCLINACION_MAX, Math.min(INCLINACION_MAX, g));

/** `fase` desfasa la respiración de cada tarjeta para que no se muevan al unísono. */
export function inclinacionTarjeta(
  frame: number,
  fase = 0,
  golpes: Golpe[] = GOLPES_CAMARA,
): { rotX: number; rotY: number } {
  const s = shakeGolpes(frame, golpes);
  return {
    rotX: tope(3 * Math.sin(frame / 45 + fase * 1.7) - s.y * 0.3),
    rotY: tope(4 * Math.sin(frame / 60 + fase) + s.x * 0.35),
  };
}
