import { interpolate, spring } from 'remotion';
import { resorte, suave, tiempos } from '../tema';

const fijar = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Avance 0→1 con la curva de marca, desde `inicio` durante `duracion` frames. */
export const avance = (frame: number, inicio: number, duracion: number = tiempos.entrada): number =>
  interpolate(frame, [inicio, inicio + duracion], [0, 1], { ...fijar, easing: suave });

/** Resorte sin rebote, para entradas de tarjetas. */
export const entrada = (frame: number, fps: number, inicio: number): number =>
  spring({ frame: frame - inicio, fps, config: resorte, durationInFrames: tiempos.entrada });

/** Interpola entre fotogramas clave con la curva de marca en cada tramo. */
export const porTramos = (frame: number, cuadros: number[], valores: number[]): number =>
  interpolate(frame, cuadros, valores, { ...fijar, easing: suave });

/** Zoom lento estilo Ken Burns (1.00 → 1.06) a lo largo de la toma. */
export const kenBurns = (frame: number, duracion: number): number =>
  interpolate(frame, [0, duracion], [1, 1.06], fijar);
