/** Anclas (frames globales) y curvas puras de las escenas finales E05–E07. */

import { aFrame, palabra } from './alineacion';
import { entrada } from './motion';

const en = (texto: string, linea: number): number => aFrame(palabra(texto, linea).inicio);

/** Línea 4: «Cada actualización cierra una puerta…». */
export const GOLPES_E05 = {
  actualizacion: en('actualización', 4),
  cierra: en('cierra', 4),
};

/** Línea 5: «Verifica…, cambia…, y actualiza. Eso casi siempre alcanza». */
export const GOLPES_E06 = {
  verifica: en('Verifica', 5),
  cambia: en('cambia', 5),
  actualiza: en('actualiza', 5),
  alcanza: en('alcanza', 5),
};

/** Línea 6: «Comenta PARCHE y te paso una guía paso a paso. Y sígueme…». */
export const GOLPES_E07 = {
  comenta: en('Comenta', 6),
  parche: en('PARCHE', 6),
  paso: en('paso', 6),
  sigueme: en('sígueme', 6),
};

/** Grados de apertura de la puerta alrededor de los que oscila mientras espera. */
export const ANGULO_ABIERTA = 52;
/** Amplitud (grados) de la oscilación de la puerta entreabierta. */
export const OSCILACION_PUERTA = 6;
/** Frames que tarda en cerrarse: el portazo golpea exactamente en `cierra`. */
export const FRAMES_CIERRE = 8;
/** Grados del primer rebote de la puerta contra el marco. */
const REBOTE_PORTAZO = 9;

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * Apertura de la puerta en grados: oscila alrededor de `ANGULO_ABIERTA`, se cierra acelerando para
 * golpear 0 en `cierra`, rebota contra el marco sin cruzarlo y se asienta.
 */
export function anguloPuerta(frame: number, cierra: number): number {
  if (frame > cierra) {
    const k = frame - cierra;
    return REBOTE_PORTAZO * Math.exp(-k / 4) * Math.abs(Math.sin(k * 0.7));
  }
  const oscila = ANGULO_ABIERTA + OSCILACION_PUERTA * Math.sin(frame / 24);
  const p = clamp01((frame - (cierra - FRAMES_CIERRE)) / FRAMES_CIERRE);
  return oscila * (1 - p * p);
}

/**
 * Barrido repetido (brillo que cruza): posición 0–1 dentro de cada barrido de `dur` frames que arranca
 * en `inicio` y se repite cada `periodo`; null mientras descansa o antes de `inicio`.
 */
export function barridoPeriodico(
  frame: number,
  inicio: number,
  periodo: number,
  dur: number,
): number | null {
  if (frame < inicio) return null;
  const t = (frame - inicio) % periodo;
  return t < dur ? t / dur : null;
}

/** 0→1 de la transición PARCHE grande → PARCHE pequeño + «sígueme». */
export const progresoSigueme = (frame: number, sigueme: number): number =>
  entrada(frame, sigueme, 18);

/** Pose inicial (grados y px) de cada tarjeta del abanico de E06 antes de caer en su fila. */
const ABANICO = [
  { rot: -16, x: -120, y: -50 },
  { rot: 12, x: 110, y: -90 },
  { rot: -9, x: -90, y: -130 },
] as const;

/** Pose de la tarjeta `i` según el progreso `s` del spring (0 = abanico, 1 = en su fila; puede pasar de 1). */
export function poseAbanico(i: number, s: number): { rot: number; x: number; y: number } {
  const a = ABANICO[i]!;
  return { rot: a.rot * (1 - s) || 0, x: a.x * (1 - s) || 0, y: a.y * (1 - s) || 0 };
}
