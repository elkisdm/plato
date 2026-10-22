/** Curvas puras de los subtítulos: entrada con spring de la frase y píldora de la palabra activa. */

import { spring } from 'remotion';

import { entre } from '../motion';

/** Frames desde la última palabra hasta que la frase se apaga del todo. */
export const SALIDA_FRASE = 7;

const SPRING_FRASE = { damping: 14, stiffness: 200, mass: 0.6 };

export type EstadoFrase = { opacity: number; scale: number; y: number };

/** Entra con spring (escala 0.92→1, sube 12 px) y sale con un fundido rápido tras `fin`. */
export function estadoFrase(frame: number, ini: number, fin: number, fps = 30): EstadoFrase {
  const s = spring({ frame: frame - ini, fps, config: SPRING_FRASE });
  const entrada = entre(frame, ini, ini + 4);
  const salida = 1 - entre(frame, fin + 3, fin + SALIDA_FRASE);
  return { opacity: Math.min(entrada, salida), scale: 0.92 + 0.08 * s, y: 12 * (1 - s) };
}

/** Píldora (0–1) y escala (hasta 1.06) de una palabra: solo mientras es la activa. */
export function estadoPalabra(frame: number, inicio: number, activa: boolean): { pildora: number; scale: number } {
  if (!activa) return { pildora: 0, scale: 1 };
  const pildora = entre(frame, inicio, inicio + 4);
  return { pildora, scale: 1 + 0.06 * pildora };
}
