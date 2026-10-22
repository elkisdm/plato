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
