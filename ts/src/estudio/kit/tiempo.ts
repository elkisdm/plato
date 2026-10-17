import { useCurrentFrame, useVideoConfig } from 'remotion';
import { FPS } from '../tema';

/**
 * Base de tiempo del estudio: toda animación se mide en cuadros de 30 fps (`FPS`), aunque el video
 * se renderice a 60. A 60 fps el cuadro base avanza de a medio cuadro, así que cada cuadro real cae
 * en la posición intermedia exacta del movimiento (fluidez real, no cuadros duplicados).
 */
export const cuadroBase = (frame: number, fps: number): number => (frame * FPS) / fps;

/** Cuadros reales que ocupan `cuadros` de la base en un video a `fps`. */
export const aReales = (cuadros: number, fps: number): number => Math.round((cuadros * fps) / FPS);

/** El cuadro actual en la base del estudio. Las escenas que admiten 60 fps usan esto, no `useCurrentFrame`. */
export const useCuadro = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return cuadroBase(frame, fps);
};
