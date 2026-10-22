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

/** Grados de apertura de la puerta antes de cerrarse. */
export const ANGULO_ABIERTA = 52;
/** Frames que tarda en cerrarse. */
export const FRAMES_CIERRE = 14;

/** Apertura de la puerta en grados: fija hasta `cierra`, luego baja a 0 sin cruzarlo. */
export function anguloPuerta(frame: number, cierra: number): number {
  return ANGULO_ABIERTA * (1 - entrada(frame, cierra, FRAMES_CIERRE));
}

/** 0→1 de la transición PARCHE grande → PARCHE pequeño + «sígueme». */
export const progresoSigueme = (frame: number, sigueme: number): number =>
  entrada(frame, sigueme, 18);
